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

  const [{ data: properties }, { data: tenancies }] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .order("address", { ascending: true }),
    supabase
      .from("tenancies")
      .select("*")
      .order("end_date", { ascending: true }),
  ]);

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
    />
  );
}
