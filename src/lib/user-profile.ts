import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_USER_PROFILE,
  type UserProfile,
} from "@/lib/types";

function withTrialDefaults(
  userId: string,
  data?: Partial<UserProfile> | null
): UserProfile {
  const now = new Date().toISOString();
  return {
    id: userId,
    ...DEFAULT_USER_PROFILE,
    trial_started_at: data?.trial_started_at ?? now,
    created_at: data?.created_at ?? now,
    updated_at: data?.updated_at ?? now,
    full_name: data?.full_name ?? null,
    email_alerts_enabled:
      data?.email_alerts_enabled ?? DEFAULT_USER_PROFILE.email_alerts_enabled,
    alert_at_60: data?.alert_at_60 ?? DEFAULT_USER_PROFILE.alert_at_60,
    alert_at_30: data?.alert_at_30 ?? DEFAULT_USER_PROFILE.alert_at_30,
    alert_at_7: data?.alert_at_7 ?? DEFAULT_USER_PROFILE.alert_at_7,
  };
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile> {
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (data) {
    const profile = data as UserProfile;
    if (!profile.trial_started_at) {
      const startedAt = new Date().toISOString();
      await supabase
        .from("user_profiles")
        .update({ trial_started_at: startedAt, updated_at: startedAt })
        .eq("id", userId);
      return { ...profile, trial_started_at: startedAt };
    }
    return profile;
  }

  const startedAt = new Date().toISOString();
  const { data: created, error } = await supabase
    .from("user_profiles")
    .insert({
      id: userId,
      ...DEFAULT_USER_PROFILE,
      trial_started_at: startedAt,
    })
    .select("*")
    .single();

  if (error || !created) {
    return withTrialDefaults(userId, { trial_started_at: startedAt });
  }

  return created as UserProfile;
}

export async function getUserProfileById(
  admin: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return (data as UserProfile | null) ?? null;
}

export function filterAlertTiersByProfile(
  tiers: number[],
  profile: UserProfile | null
): number[] {
  if (profile && !profile.email_alerts_enabled) {
    return [];
  }

  if (!profile) {
    return tiers;
  }

  return tiers.filter((tier) => {
    if (tier === 60) return profile.alert_at_60;
    if (tier === 30) return profile.alert_at_30;
    if (tier === 7) return profile.alert_at_7;
    return false;
  });
}
