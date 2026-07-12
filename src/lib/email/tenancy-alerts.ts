import { sendTenancyAlertEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatTenancyDate,
  getDaysUntilDate,
  getRentReviewAlertTiers,
  getRightToRentAlertTiers,
  getTenancyEndAlertTiers,
  isDepositProtectionOverdue,
  type Tenancy,
  type TenancyAlertType,
} from "@/lib/tenancy";
import { getUserProfileById } from "@/lib/user-profile";
import type { SendAlertsResult } from "@/lib/email/alerts";

function isUniqueViolation(error: { code?: string }) {
  return error.code === "23505";
}

async function claimTenancyAlertSlot(
  admin: ReturnType<typeof createAdminClient>,
  tenancyId: string,
  alertType: TenancyAlertType,
  alertDays: number
): Promise<boolean> {
  const { data, error } = await admin
    .from("tenancy_alerts")
    .insert({
      tenancy_id: tenancyId,
      alert_type: alertType,
      alert_days: alertDays,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (isUniqueViolation(error)) {
      return false;
    }
    throw new Error(
      `Failed to record tenancy alert for ${tenancyId} (${alertType}/${alertDays}): ${error.message}`
    );
  }

  return Boolean(data);
}

async function releaseTenancyAlertSlot(
  admin: ReturnType<typeof createAdminClient>,
  tenancyId: string,
  alertType: TenancyAlertType,
  alertDays: number
) {
  await admin
    .from("tenancy_alerts")
    .delete()
    .eq("tenancy_id", tenancyId)
    .eq("alert_type", alertType)
    .eq("alert_days", alertDays);
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

function isTierEnabled(
  profile: Awaited<ReturnType<typeof getUserProfileById>>,
  tier: number
): boolean {
  if (!profile?.email_alerts_enabled) {
    return false;
  }

  if (tier === 0) {
    return true;
  }

  if (tier === 90 || tier === 60) {
    return profile.alert_at_60;
  }

  if (tier === 30) {
    return profile.alert_at_30;
  }

  if (tier === 7) {
    return profile.alert_at_7;
  }

  return false;
}

async function processTenancyAlert({
  admin,
  tenancy,
  alertType,
  alertTier,
  alertLabel,
  dueDate,
  daysRemaining,
  emailCache,
  profileCache,
  result,
}: {
  admin: ReturnType<typeof createAdminClient>;
  tenancy: Tenancy;
  alertType: TenancyAlertType;
  alertTier: number;
  alertLabel: string;
  dueDate: string;
  daysRemaining: number;
  emailCache: Map<string, string | null>;
  profileCache: Map<string, Awaited<ReturnType<typeof getUserProfileById>>>;
  result: SendAlertsResult;
}) {
  let profile = profileCache.get(tenancy.user_id);
  if (profile === undefined) {
    profile = await getUserProfileById(admin, tenancy.user_id);
    profileCache.set(tenancy.user_id, profile);
  }

  if (!isTierEnabled(profile, alertTier)) {
    result.skipped += 1;
    return;
  }

  let claimed = false;

  try {
    claimed = await claimTenancyAlertSlot(
      admin,
      tenancy.id,
      alertType,
      alertTier
    );

    if (!claimed) {
      result.skipped += 1;
      return;
    }

    const email = await getUserEmail(admin, tenancy.user_id, emailCache);

    if (!email) {
      await releaseTenancyAlertSlot(admin, tenancy.id, alertType, alertTier);
      result.errors.push(`No email found for user ${tenancy.user_id}`);
      return;
    }

    const sendResult = await sendTenancyAlertEmail({
      to: email,
      alertType,
      tenantNames: tenancy.tenant_names,
      propertyAddress: tenancy.property_address,
      alertLabel,
      dueDate: formatTenancyDate(dueDate),
      daysRemaining,
      alertTier,
    });

    if (sendResult.error) {
      await releaseTenancyAlertSlot(admin, tenancy.id, alertType, alertTier);
      result.errors.push(sendResult.error.message);
      return;
    }

    result.sent += 1;
  } catch (error) {
    if (claimed) {
      await releaseTenancyAlertSlot(admin, tenancy.id, alertType, alertTier);
    }

    result.errors.push(
      error instanceof Error ? error.message : "Unknown tenancy alert error"
    );
  }
}

export async function sendTenancyAlerts(): Promise<SendAlertsResult> {
  const admin = createAdminClient();
  const result: SendAlertsResult = {
    checked: 0,
    sent: 0,
    skipped: 0,
    errors: [],
  };

  const { data: tenancies, error } = await admin.from("tenancies").select("*");

  if (error) {
    throw new Error(error.message);
  }

  const emailCache = new Map<string, string | null>();
  const profileCache = new Map<
    string,
    Awaited<ReturnType<typeof getUserProfileById>>
  >();

  for (const tenancy of (tenancies ?? []) as Tenancy[]) {
    result.checked += 1;

    const daysUntilEnd = getDaysUntilDate(tenancy.end_date);
    for (const tier of getTenancyEndAlertTiers(daysUntilEnd)) {
      await processTenancyAlert({
        admin,
        tenancy,
        alertType: "tenancy_end",
        alertTier: tier,
        alertLabel: "Tenancy End Date",
        dueDate: tenancy.end_date,
        daysRemaining: daysUntilEnd,
        emailCache,
        profileCache,
        result,
      });
    }

    if (tenancy.rent_review_date) {
      const daysUntilReview = getDaysUntilDate(tenancy.rent_review_date);
      for (const tier of getRentReviewAlertTiers(daysUntilReview)) {
        await processTenancyAlert({
          admin,
          tenancy,
          alertType: "rent_review",
          alertTier: tier,
          alertLabel: "Rent Review Date",
          dueDate: tenancy.rent_review_date,
          daysRemaining: daysUntilReview,
          emailCache,
          profileCache,
          result,
        });
      }
    }

    if (isDepositProtectionOverdue(tenancy)) {
      await processTenancyAlert({
        admin,
        tenancy,
        alertType: "deposit_overdue",
        alertTier: 0,
        alertLabel: "Deposit Protection Overdue",
        dueDate: tenancy.start_date,
        daysRemaining: -getDaysUntilDate(tenancy.start_date),
        emailCache,
        profileCache,
        result,
      });
    }

    if (tenancy.right_to_rent_expiry) {
      const daysUntilExpiry = getDaysUntilDate(tenancy.right_to_rent_expiry);
      for (const tier of getRightToRentAlertTiers(daysUntilExpiry)) {
        await processTenancyAlert({
          admin,
          tenancy,
          alertType: "right_to_rent",
          alertTier: tier,
          alertLabel: "Right to Rent Expiry",
          dueDate: tenancy.right_to_rent_expiry,
          daysRemaining: daysUntilExpiry,
          emailCache,
          profileCache,
          result,
        });
      }
    }
  }

  return result;
}
