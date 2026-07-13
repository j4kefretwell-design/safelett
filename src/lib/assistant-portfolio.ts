import {
  getCertificateStatus,
  getDaysUntilExpiry,
  getPropertyStatus,
  getStatusLabel,
} from "@/lib/compliance";
import {
  CERTIFICATE_LABELS,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";
import {
  DEPOSIT_SCHEME_LABELS,
  getTenancyStatus,
  isDepositProtectionOverdue,
  TENANCY_STATUS_LABELS,
  TENANCY_TYPE_LABELS,
  type Tenancy,
} from "@/lib/tenancy";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function buildPortfolioContext(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const [{ data: properties }, { data: tenancies }] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .eq("user_id", userId)
      .order("address", { ascending: true }),
    supabase
      .from("tenancies")
      .select("*")
      .eq("user_id", userId)
      .order("end_date", { ascending: true }),
  ]);

  const propertyList = (properties ?? []) as Property[];
  const tenancyList = (tenancies ?? []) as Tenancy[];
  const propertyIds = propertyList.map((property) => property.id);

  let certificateList: Certificate[] = [];
  if (propertyIds.length > 0) {
    const { data: certificates } = await supabase
      .from("certificates")
      .select("*")
      .in("property_id", propertyIds);
    certificateList = (certificates ?? []) as Certificate[];
  }

  const certificatesByProperty = new Map<string, Certificate[]>();
  for (const certificate of certificateList) {
    const existing = certificatesByProperty.get(certificate.property_id) ?? [];
    existing.push(certificate);
    certificatesByProperty.set(certificate.property_id, existing);
  }

  const propertyLines = propertyList.map((property) => {
    const certs = certificatesByProperty.get(property.id) ?? [];
    const status = getPropertyStatus(certs);
    const certDetails =
      certs.length === 0
        ? "  No certificates recorded"
        : certs
            .map((certificate) => {
              const days = getDaysUntilExpiry(certificate.expiry_date);
              const label =
                CERTIFICATE_LABELS[certificate.certificate_type] ??
                certificate.certificate_type;
              return `  - ${label}: expires ${certificate.expiry_date} (${days} days, ${getCertificateStatus(certificate.expiry_date)})`;
            })
            .join("\n");

    return [
      `Property: ${property.address}`,
      `  Type: ${PROPERTY_TYPE_LABELS[property.property_type] ?? property.property_type}`,
      `  Bedrooms: ${property.bedrooms}`,
      `  Compliance status: ${getStatusLabel(status)}`,
      certDetails,
    ].join("\n");
  });

  const tenancyLines = tenancyList.map((tenancy) => {
    const status = getTenancyStatus(tenancy);
    const depositUnprotected =
      (tenancy.deposit_amount != null &&
        tenancy.deposit_amount > 0 &&
        tenancy.deposit_scheme === "none") ||
      isDepositProtectionOverdue(tenancy);

    return [
      `Tenancy: ${tenancy.tenant_names} at ${tenancy.property_address}`,
      `  Status: ${TENANCY_STATUS_LABELS[status]}`,
      `  Type: ${TENANCY_TYPE_LABELS[tenancy.tenancy_type] ?? tenancy.tenancy_type}`,
      `  Start: ${tenancy.start_date}`,
      `  End: ${tenancy.end_date}`,
      `  Monthly rent: £${tenancy.monthly_rent}`,
      `  Rent review date: ${tenancy.rent_review_date ?? "not set"}`,
      `  Deposit: ${
        tenancy.deposit_amount != null ? `£${tenancy.deposit_amount}` : "not set"
      } (${
        tenancy.deposit_scheme
          ? DEPOSIT_SCHEME_LABELS[tenancy.deposit_scheme]
          : "scheme unknown"
      })`,
      `  Deposit protection concern: ${depositUnprotected ? "yes" : "no"}`,
      `  Right to rent checked: ${tenancy.right_to_rent_checked ? "yes" : "no"}`,
      `  Right to rent expiry: ${tenancy.right_to_rent_expiry ?? "not set"}`,
      `  Property id: ${tenancy.property_id ?? "unlinked"}`,
    ].join("\n");
  });

  const expiringSoon = certificateList
    .filter((certificate) => {
      const days = getDaysUntilExpiry(certificate.expiry_date);
      return days >= 0 && days <= 60;
    })
    .map((certificate) => {
      const property = propertyList.find((p) => p.id === certificate.property_id);
      const label =
        CERTIFICATE_LABELS[certificate.certificate_type] ??
        certificate.certificate_type;
      return `- ${label} at ${property?.address ?? "unknown property"} expires ${certificate.expiry_date} (${getDaysUntilExpiry(certificate.expiry_date)} days)`;
    });

  const overdueCerts = certificateList
    .filter((certificate) => getDaysUntilExpiry(certificate.expiry_date) < 0)
    .map((certificate) => {
      const property = propertyList.find((p) => p.id === certificate.property_id);
      const label =
        CERTIFICATE_LABELS[certificate.certificate_type] ??
        certificate.certificate_type;
      return `- ${label} at ${property?.address ?? "unknown property"} overdue since ${certificate.expiry_date}`;
    });

  const renewalSoon = tenancyList
    .filter((tenancy) => {
      const status = getTenancyStatus(tenancy);
      return status === "renewal_due" || status === "expired";
    })
    .map(
      (tenancy) =>
        `- ${tenancy.tenant_names} at ${tenancy.property_address} ends ${tenancy.end_date} (${TENANCY_STATUS_LABELS[getTenancyStatus(tenancy)]})`
    );

  return [
    `Portfolio summary for user ${userId}`,
    `Properties: ${propertyList.length}`,
    `Tenancies: ${tenancyList.length}`,
    `Certificates: ${certificateList.length}`,
    "",
    "=== PROPERTIES & CERTIFICATES ===",
    propertyLines.length > 0 ? propertyLines.join("\n\n") : "No properties recorded.",
    "",
    "=== TENANCIES ===",
    tenancyLines.length > 0 ? tenancyLines.join("\n\n") : "No tenancies recorded.",
    "",
    "=== CERTIFICATES EXPIRING WITHIN 60 DAYS ===",
    expiringSoon.length > 0 ? expiringSoon.join("\n") : "None.",
    "",
    "=== OVERDUE CERTIFICATES ===",
    overdueCerts.length > 0 ? overdueCerts.join("\n") : "None.",
    "",
    "=== TENANCIES RENEWAL DUE OR EXPIRED ===",
    renewalSoon.length > 0 ? renewalSoon.join("\n") : "None.",
  ].join("\n");
}
