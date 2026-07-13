import AssistantHomeClient from "@/components/assistant/AssistantHomeClient";
import {
  buildAssistantInsights,
  buildSmartSuggestions,
} from "@/lib/assistant-insights";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export default async function AssistantHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AssistantHomeClient suggestions={[]} />
    );
  }

  const [{ data: properties }, { data: tenancies }] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("address", { ascending: true }),
    supabase
      .from("tenancies")
      .select("*")
      .eq("user_id", user.id)
      .order("end_date", { ascending: true }),
  ]);

  const propertyList = (properties ?? []) as Property[];
  const tenancyList = (tenancies ?? []) as Tenancy[];
  const propertyIds = propertyList.map((property) => property.id);

  let certificates: Certificate[] = [];
  if (propertyIds.length > 0) {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .in("property_id", propertyIds);
    certificates = (data ?? []) as Certificate[];
  }

  const insights = buildAssistantInsights({
    properties: propertyList,
    certificates,
    tenancies: tenancyList,
  });

  return (
    <AssistantHomeClient suggestions={buildSmartSuggestions(insights)} />
  );
}
