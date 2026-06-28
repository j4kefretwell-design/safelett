import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import PropertyCard from "@/components/PropertyCard";
import SummaryCard from "@/components/SummaryCard";
import { getPropertyStatus } from "@/lib/compliance";
import { btnPrimaryClassName, cardClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";

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

      <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Properties" value={stats.total} accent="navy" />
        <SummaryCard label="Compliant" value={stats.compliant} accent="green" />
        <SummaryCard
          label="Needs Attention"
          value={stats.attention}
          accent="amber"
        />
        <SummaryCard label="Overdue" value={stats.overdue} accent="red" />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-navy-950">
          Your Properties
        </h2>

        {propertiesWithStatus.length === 0 ? (
          <div
            className={`${cardClassName} flex flex-col items-center px-8 py-16 text-center`}
          >
            <p className="text-lg font-semibold text-navy-950">
              No properties yet
            </p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Add your first property to start tracking compliance certificates
              across your portfolio.
            </p>
            <Link href="/properties/new" className={`${btnPrimaryClassName} mt-6`}>
              Add Property
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {propertiesWithStatus.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                status={property.status}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
