export const TRIAL_LENGTH_DAYS = 14;
export const TRIAL_GRACE_HOURS = 24;

export type TrialAccessReason =
  | "subscribed"
  | "trial"
  | "grace"
  | "expired"
  | "unknown";

export interface TrialAccess {
  allowed: boolean;
  inTrial: boolean;
  /** Whole days remaining in the free trial (0 when not in trial). */
  daysRemaining: number;
  reason: TrialAccessReason;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  lockoutAt: string | null;
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isActiveSubscriptionStatus(
  status: string | null | undefined
): boolean {
  if (!status) return false;
  return ACTIVE_STATUSES.has(status.toLowerCase());
}

export function evaluateTrialAccess(params: {
  trialStartedAt: string | null | undefined;
  subscriptionStatus: string | null | undefined;
  now?: Date;
}): TrialAccess {
  const now = params.now ?? new Date();

  if (isActiveSubscriptionStatus(params.subscriptionStatus)) {
    return {
      allowed: true,
      inTrial: false,
      daysRemaining: 0,
      reason: "subscribed",
      trialStartedAt: params.trialStartedAt ?? null,
      trialEndsAt: null,
      lockoutAt: null,
    };
  }

  if (!params.trialStartedAt) {
    return {
      allowed: true,
      inTrial: true,
      daysRemaining: TRIAL_LENGTH_DAYS,
      reason: "unknown",
      trialStartedAt: null,
      trialEndsAt: null,
      lockoutAt: null,
    };
  }

  const started = new Date(params.trialStartedAt);
  if (Number.isNaN(started.getTime())) {
    return {
      allowed: true,
      inTrial: true,
      daysRemaining: TRIAL_LENGTH_DAYS,
      reason: "unknown",
      trialStartedAt: params.trialStartedAt,
      trialEndsAt: null,
      lockoutAt: null,
    };
  }

  const trialEndsAt = new Date(
    started.getTime() + TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000
  );
  const lockoutAt = new Date(
    trialEndsAt.getTime() + TRIAL_GRACE_HOURS * 60 * 60 * 1000
  );

  if (now < trialEndsAt) {
    const msRemaining = trialEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
    return {
      allowed: true,
      inTrial: true,
      daysRemaining,
      reason: "trial",
      trialStartedAt: started.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      lockoutAt: lockoutAt.toISOString(),
    };
  }

  if (now < lockoutAt) {
    return {
      allowed: true,
      inTrial: false,
      daysRemaining: 0,
      reason: "grace",
      trialStartedAt: started.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      lockoutAt: lockoutAt.toISOString(),
    };
  }

  return {
    allowed: false,
    inTrial: false,
    daysRemaining: 0,
    reason: "expired",
    trialStartedAt: started.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    lockoutAt: lockoutAt.toISOString(),
  };
}
