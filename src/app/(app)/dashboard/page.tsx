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
    <div className="w-full space-y-0">
      <section className="relative w-full overflow-hidden bg-raspberry">
        <div className="absolute inset-0">
          <Image
            src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.38]"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-raspberry/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0C]/85 via-transparent to-raspberry/20" />

        <div className="relative z-10 flex flex-col items-center justify-center px-8 py-24 text-center sm:px-12 sm:py-28 lg:px-16 lg:py-32">
          <p className="font-serif text-sm italic tracking-wide text-gold">
            Portfolio Status —
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-3xl italic leading-tight tracking-wide text-dusty-cream sm:text-4xl lg:text-5xl xl:text-6xl">
            {isCompliant
              ? "All Properties Compliant"
              : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
          </h1>
          {!isCompliant && (
            <p className="mt-6 max-w-lg text-sm font-light text-dusty-cream/70">
              {stats.overdue > 0 && (
                <span>
                  {stats.overdue} overdue
                  {stats.attention > 0 ? " · " : ""}
                </span>
              )}
              {stats.attention > 0 && (
                <span>{stats.attention} approaching expiry</span>
              )}
            </p>
          )}
        </div>
      </section>

      <section className="flex w-full divide-x divide-leather/20">
        {statItems.map((item) => (
          <div
            key={item.key}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center border-t-[3px] bg-sand px-4 py-12 sm:px-6 sm:py-14 ${statAccentClasses[item.key]}`}
          >
            <p className="font-serif text-5xl tracking-wide text-text sm:text-6xl lg:text-7xl">
              {item.value}
            </p>
            <p className="mt-5 text-center text-[10px] font-normal uppercase tracking-[0.24em] text-leather">
              {item.label}
            </p>
          </div>
        ))}
      </section>

      <section className="w-full bg-espresso px-8 py-14 text-center sm:px-12 sm:py-16 lg:px-16">
        <p className="font-serif text-xl italic tracking-wide text-dusty-cream/85 sm:text-2xl">
          Every deadline met. Every property protected.
        </p>
      </section>

      <DashboardPortfolio
        properties={
          propertiesWithStatus as (Property & { status: ComplianceStatus })[]
        }
        totalCount={stats.total}
      />
    </div>
  );
}
