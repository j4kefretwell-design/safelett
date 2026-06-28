import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_USER_PROFILE,
  type UserProfile,
} from "@/lib/types";

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
    return data as UserProfile;
  }

  const { data: created, error } = await supabase
    .from("user_profiles")
    .insert({ id: userId, ...DEFAULT_USER_PROFILE })
    .select("*")
    .single();

  if (error || !created) {
    return {
      id: userId,
      ...DEFAULT_USER_PROFILE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
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
