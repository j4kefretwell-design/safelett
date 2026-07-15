import type { SupabaseClient } from "@supabase/supabase-js";
import {
  evaluateTrialAccess,
  type TrialAccess,
} from "@/lib/trial-access";
import { DEFAULT_USER_PROFILE } from "@/lib/types";

async function ensureTrialStartedAt(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("trial_started_at")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.trial_started_at) {
    return profile.trial_started_at as string;
  }

  const startedAt = new Date().toISOString();

  if (profile) {
    await supabase
      .from("user_profiles")
      .update({ trial_started_at: startedAt, updated_at: startedAt })
      .eq("id", userId);
    return startedAt;
  }

  await supabase.from("user_profiles").insert({
    id: userId,
    ...DEFAULT_USER_PROFILE,
    trial_started_at: startedAt,
  });

  return startedAt;
}

export async function getTrialAccessForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<TrialAccess> {
  const trialStartedAt = await ensureTrialStartedAt(supabase, userId);

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  return evaluateTrialAccess({
    trialStartedAt,
    subscriptionStatus: (subscription?.status as string | null) ?? null,
  });
}
