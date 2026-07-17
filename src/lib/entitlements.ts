import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionModuleId } from "@/lib/subscription";

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"];

export async function getActivePlan(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionModuleId | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_name, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data || !ACTIVE_SUBSCRIPTION_STATUSES.includes(data.status)) {
    return null;
  }

  return data.plan_name === "compliance" ||
    data.plan_name === "tenancy" ||
    data.plan_name === "professional"
    ? data.plan_name
    : null;
}

export async function compliancePropertyLimitReached(
  supabase: SupabaseClient,
  userId: string,
  additionalProperties = 1
): Promise<boolean> {
  const plan = await getActivePlan(supabase, userId);
  if (plan !== "compliance") return false;

  const { count, error } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return (count ?? 0) + additionalProperties > 15;
}

export const PROPERTY_LIMIT_PROMPT = {
  code: "UPGRADE_REQUIRED",
  limitCode: "PROPERTY_LIMIT",
  error: "You've reached the 15 property limit.",
  title: "You've reached the 15 property limit",
  message: "Upgrade to Professional for unlimited properties.",
} as const;
