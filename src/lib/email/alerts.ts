import {
  formatDate,
  getApplicableAlertTiers,
  getDaysUntilExpiry,
  type ExpiryAlertDay,
} from "@/lib/compliance";
import {
  filterAlertTiersByProfile,
  getUserProfileById,
} from "@/lib/user-profile";
import { sendExpiryAlertEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { CERTIFICATE_LABELS, type CertificateType } from "@/lib/types";

interface ContractorContact {
  name: string;
  company_name: string;
  phone: string;
  email: string;
}

interface PropertyContractorAssignmentRow {
  property_id: string;
  certificate_type: CertificateType;
  contractors: ContractorContact | null;
}

function normalizeAssignmentRows(
  rows: Array<{
    property_id: string;
    certificate_type: CertificateType;
    contractors: ContractorContact | ContractorContact[] | null;
  }>
): PropertyContractorAssignmentRow[] {
  const normalized: PropertyContractorAssignmentRow[] = [];

  for (const row of rows) {
    const contractor = Array.isArray(row.contractors)
      ? row.contractors[0]
      : row.contractors;

    if (!contractor) continue;

    normalized.push({
      property_id: row.property_id,
      certificate_type: row.certificate_type,
      contractors: contractor,
    });
  }

  return normalized;
}

function buildContractorLookup(assignments: PropertyContractorAssignmentRow[]) {
  const lookup = new Map<string, ContractorContact>();

  for (const assignment of assignments) {
    if (!assignment.contractors) continue;
    lookup.set(
      `${assignment.property_id}:${assignment.certificate_type}`,
      assignment.contractors
    );
  }

  return lookup;
}

function getContractorForCertificate(
  lookup: Map<string, ContractorContact>,
  propertyId: string,
  certificateType: CertificateType
) {
  const contractor = lookup.get(`${propertyId}:${certificateType}`);

  if (!contractor) {
    return undefined;
  }

  return {
    name: contractor.name,
    companyName: contractor.company_name,
    phone: contractor.phone,
    email: contractor.email,
  };
}

interface CertificateRow {
  id: string;
  property_id: string;
  certificate_type: CertificateType;
  expiry_date: string;
  properties:
    | {
        address: string;
        user_id: string;
      }
    | {
        address: string;
        user_id: string;
      }[]
    | null;
}

function getPropertyFromCertificate(certificate: CertificateRow) {
  if (!certificate.properties) {
    return null;
  }

  return Array.isArray(certificate.properties)
    ? certificate.properties[0] ?? null
    : certificate.properties;
}

export interface SendAlertsResult {
  checked: number;
  sent: number;
  skipped: number;
  errors: string[];
}

async function getUserEmail(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  cache: Map<string, string | null>
): Promise<string | null> {
  if (cache.has(userId)) {
    return cache.get(userId) ?? null;
  }

  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user?.email) {
    cache.set(userId, null);
    return null;
  }

  cache.set(userId, data.user.email);
  return data.user.email;
}

function isUniqueViolation(error: { code?: string; message?: string }) {
  return error.code === "23505";
}

/**
 * Atomically claim an alert slot before sending email.
 * Returns true only when this run inserted the row (alert not sent before).
 */
async function claimAlertSlot(
  admin: ReturnType<typeof createAdminClient>,
  certificateId: string,
  alertTier: ExpiryAlertDay
): Promise<boolean> {
  const { data, error } = await admin
    .from("certificate_alerts")
    .insert({
      certificate_id: certificateId,
      alert_days: alertTier,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (isUniqueViolation(error)) {
      return false;
    }

    throw new Error(
      `Failed to record alert for certificate ${certificateId} (${alertTier}-day tier): ${error.message}`
    );
  }

  return Boolean(data);
}

async function releaseAlertSlot(
  admin: ReturnType<typeof createAdminClient>,
  certificateId: string,
  alertTier: ExpiryAlertDay
) {
  const { error } = await admin
    .from("certificate_alerts")
    .delete()
    .eq("certificate_id", certificateId)
    .eq("alert_days", alertTier);

  if (error) {
    throw new Error(
      `Failed to release alert slot for certificate ${certificateId} (${alertTier}-day tier): ${error.message}`
    );
  }
}

export async function sendCertificateExpiryAlerts(): Promise<SendAlertsResult> {
  const admin = createAdminClient();
  const result: SendAlertsResult = {
    checked: 0,
    sent: 0,
    skipped: 0,
    errors: [],
  };

  const { data: certificates, error } = await admin
    .from("certificates")
    .select(
      `
      id,
      property_id,
      certificate_type,
      expiry_date,
      properties (
        address,
        user_id
      )
    `
    );

  if (error) {
    throw new Error(error.message);
  }

  const { data: assignments, error: contractorsError } = await admin
    .from("property_contractors")
    .select(
      "property_id, certificate_type, contractors(name, company_name, phone, email)"
    );

  if (contractorsError) {
    throw new Error(contractorsError.message);
  }

  const contractorLookup = buildContractorLookup(
    normalizeAssignmentRows(
      (assignments ?? []) as Array<{
        property_id: string;
        certificate_type: CertificateType;
        contractors: ContractorContact | ContractorContact[] | null;
      }>
    )
  );

  const emailCache = new Map<string, string | null>();
  const profileCache = new Map<
    string,
    Awaited<ReturnType<typeof getUserProfileById>>
  >();

  for (const certificate of (certificates ?? []) as CertificateRow[]) {
    result.checked += 1;

    const property = getPropertyFromCertificate(certificate);
    if (!property) {
      result.skipped += 1;
      continue;
    }

    const daysUntilExpiry = getDaysUntilExpiry(certificate.expiry_date);
    const alertTiers = getApplicableAlertTiers(daysUntilExpiry);

    let userProfile = profileCache.get(property.user_id);
    if (userProfile === undefined) {
      userProfile = await getUserProfileById(admin, property.user_id);
      profileCache.set(property.user_id, userProfile);
    }

    const enabledTiers = filterAlertTiersByProfile(
      alertTiers,
      userProfile
    ) as ExpiryAlertDay[];

    if (enabledTiers.length === 0) {
      result.skipped += 1;
      continue;
    }

    for (const alertTier of enabledTiers) {
      let claimed = false;

      try {
        claimed = await claimAlertSlot(admin, certificate.id, alertTier);

        if (!claimed) {
          result.skipped += 1;
          continue;
        }

        const email = await getUserEmail(admin, property.user_id, emailCache);

        if (!email) {
          await releaseAlertSlot(admin, certificate.id, alertTier);
          result.errors.push(
            `No email found for user ${property.user_id} (certificate ${certificate.id})`
          );
          continue;
        }

        const sendResult = await sendExpiryAlertEmail({
          to: email,
          propertyAddress: property.address,
          certificateLabel: CERTIFICATE_LABELS[certificate.certificate_type],
          expiryDate: formatDate(certificate.expiry_date),
          daysRemaining: daysUntilExpiry,
          alertTier,
          contractor: getContractorForCertificate(
            contractorLookup,
            certificate.property_id,
            certificate.certificate_type
          ),
        });

        if (sendResult.error) {
          await releaseAlertSlot(admin, certificate.id, alertTier);
          result.errors.push(sendResult.error.message);
          continue;
        }

        result.sent += 1;
      } catch (alertError) {
        if (claimed) {
          try {
            await releaseAlertSlot(admin, certificate.id, alertTier);
          } catch (releaseError) {
            result.errors.push(
              releaseError instanceof Error
                ? releaseError.message
                : "Failed to release alert slot after error"
            );
          }
        }

        result.errors.push(
          alertError instanceof Error
            ? alertError.message
            : "Unknown alert processing error"
        );
      }
    }
  }

  return result;
}
