import DashboardClient from "@/components/DashboardClient";
import PageHeader from "@/components/layout/PageHeader";
import { getPropertyStatus } from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, ComplianceStatus, Property } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  const propertyList = (properties ?? []) as Property[];

  const propertiesWithStatus = await Promise.all(
    propertyList.map(async (property) => {
      const { data: certificates } = await supabase
        .from("certificates")
        .select("expiry_date")
        .eq("property_id", property.id);

      const status = getPropertyStatus(
        (certificates ?? []) as Pick<Certificate, "expiry_date">[]
      );

      return { ...property, status };
    })
  );

  const stats = {
    total: propertiesWithStatus.length,
    compliant: propertiesWithStatus.filter((p) => p.status === "green").length,
    attention: propertiesWithStatus.filter((p) => p.status === "amber").length,
    overdue: propertiesWithStatus.filter((p) => p.status === "red").length,
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of compliance across your property portfolio."
        actionHref="/properties/new"
        actionLabel="Add Property"
      />

      <DashboardClient
        properties={
          propertiesWithStatus as (Property & { status: ComplianceStatus })[]
        }
        stats={stats}
      />
    </>
  );
}
