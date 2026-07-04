import Image from "next/image";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { getPropertyStatus } from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, ComplianceStatus, Property } from "@/lib/types";
import DashboardPortfolio from "./DashboardPortfolio";

const statAccentClasses = {
  total: "border-t-gold",
  compliant: "border-t-compliant",
  attention: "border-t-attention",
  overdue: "border-t-urgent",
} as const;

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

  if (propertiesWithStatus.length === 0) {
    return <DashboardEmptyState />;
  }

  const needsAttention = stats.attention + stats.overdue;
  const isCompliant = needsAttention === 0;

  const statItems = [
    { key: "total" as const, label: "Total Properties", value: stats.total },
    { key: "compliant" as const, label: "Compliant", value: stats.compliant },
    {
      key: "attention" as const,
      label: "Needs Attention",
      value: stats.attention,
    },
    { key: "overdue" as const, label: "Overdue", value: stats.overdue },
  ];

  return (
    <div className="w-full">
      <section className="relative h-[280px] max-h-[280px] w-full overflow-hidden bg-raspberry">
        <div className="absolute inset-0">
          <Image
            src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-raspberry/70" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
          <p className="font-serif text-sm italic tracking-wide text-gold">
            Portfolio Status —
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-tight tracking-wide text-dusty-cream sm:text-4xl lg:text-5xl">
            {isCompliant
              ? "All Properties Compliant"
              : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
          </h1>
        </div>
      </section>

      <div className="bg-dusty-cream px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {statItems.map((item) => (
            <div
              key={item.key}
              className={`border border-leather/30 border-t-[3px] bg-white px-5 py-10 text-center ${statAccentClasses[item.key]}`}
            >
              <p className="font-serif text-4xl tracking-wide text-text sm:text-5xl lg:text-6xl">
                {item.value}
              </p>
              <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.22em] text-leather">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="my-14 h-px w-full bg-leather/30" aria-hidden="true" />

        <DashboardPortfolio
          properties={
            propertiesWithStatus as (Property & { status: ComplianceStatus })[]
          }
        />
      </div>
    </div>
  );
}
