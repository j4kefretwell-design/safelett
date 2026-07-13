import AssistantDraftClient from "@/components/assistant/AssistantDraftClient";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export default async function AssistantDraftPage() {
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

  return (
    <AssistantDraftClient
      properties={(properties ?? []) as Property[]}
      tenancies={(tenancies ?? []) as Tenancy[]}
    />
  );
}
