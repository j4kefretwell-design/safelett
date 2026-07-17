import AssistantChatLazy from "@/components/assistant/AssistantChatLazy";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export const revalidate = 30;

export default async function AssistantHomePage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const utcDayStart = new Date();
  utcDayStart.setUTCHours(0, 0, 0, 0);

  const [
    { data: properties },
    { data: tenancies },
    { data: subscription },
    { count: dailyUsageCount },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .order("address", { ascending: true }),
    supabase
      .from("tenancies")
      .select("*")
      .order("end_date", { ascending: true }),
    supabase
      .from("subscriptions")
      .select("plan_name, status")
      .maybeSingle(),
    supabase
      .from("feature_usage")
      .select("id", { count: "exact", head: true })
      .in("feature", ["assistant_question", "document_draft"])
      .gte("created_at", utcDayStart.toISOString()),
  ]);

  const isProfessional =
    subscription?.plan_name === "professional" &&
    (subscription.status === "active" || subscription.status === "trialing");

  const action =
    params.action === "draft" ||
    params.action === "compliance" ||
    params.action === "expiry" ||
    params.action === "ask" ||
    params.action === "tenancy" ||
    params.action === "property"
      ? params.action
      : null;

  return (
    <AssistantChatLazy
      properties={(properties ?? []) as Property[]}
      tenancies={(tenancies ?? []) as Tenancy[]}
      initialAction={action}
      initialDailyUsage={isProfessional ? null : Math.min(dailyUsageCount ?? 0, 6)}
    />
  );
}
