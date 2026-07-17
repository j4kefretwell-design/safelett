import type { SupabaseClient } from "@supabase/supabase-js";

export type LimitedFeature =
  | "assistant_question"
  | "document_draft"
  | "annual_report";

export type UsageLimitCode =
  | "AI_DAILY_LIMIT"
  | "DOCUMENT_DAILY_LIMIT"
  | "REPORT_MONTHLY_LIMIT";

interface UsageResult {
  allowed: boolean;
  code?: UsageLimitCode;
  remaining?: number | null;
  daily_used?: number | null;
  daily_remaining?: number | null;
  professional?: boolean;
}

export async function consumeFeatureUsage(
  supabase: SupabaseClient,
  feature: LimitedFeature
): Promise<UsageResult> {
  const { data, error } = await supabase.rpc("consume_feature_usage", {
    p_feature: feature,
  });

  if (error) {
    console.error("[usage-limits] Unable to record usage:", error.message);
    throw new Error("Usage limits are not configured.");
  }

  return data as UsageResult;
}

export function usageLimitResponse(code: UsageLimitCode) {
  if (code === "DOCUMENT_DAILY_LIMIT") {
    return {
      code: "UPGRADE_REQUIRED",
      limitCode: code,
      error: "You've reached your daily document limit.",
      title: "You've reached your daily limit",
      message:
        "Upgrade to Professional for unlimited document drafting and AI assistant access.",
    };
  }

  if (code === "REPORT_MONTHLY_LIMIT") {
    return {
      code: "UPGRADE_REQUIRED",
      limitCode: code,
      error: "You've reached your monthly annual report limit.",
      title: "Monthly report limit reached",
      message:
        "Upgrade to Professional for unlimited annual compliance reports.",
    };
  }

  return {
    code: "UPGRADE_REQUIRED",
    limitCode: code,
    error: "You've reached your daily AI assistant limit.",
    title: "You've reached your daily limit",
    message: "Upgrade to Professional for unlimited AI assistant access.",
  };
}
