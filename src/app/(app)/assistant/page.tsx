import AssistantChat from "@/components/assistant/AssistantChat";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

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
    params.action === "expiry"
      ? params.action
      : null;

  return (
    <AssistantChat
      properties={(properties ?? []) as Property[]}
      tenancies={(tenancies ?? []) as Tenancy[]}
      initialAction={action}
    />
  );
}
