import Image from "next/image";
import Link from "next/link";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { getPropertyStatus } from "@/lib/compliance";
import { btnGoldClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, ComplianceStatus, Property } from "@/lib/types";
import DashboardPortfolio from "./DashboardPortfolio";
import DashboardStatusBand from "./DashboardStatusBand";

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
    {
      label: "Total Properties",
      value: stats.total,
      description: "Across your portfolio",
    },
    {
      label: "Compliant",
      value: stats.compliant,
      description: "Certificates up to date",
    },
    {
      label: "Needs Attention",
      value: stats.attention,
      description: "Approaching expiry",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      description: "Past due date",
    },
  ];

  return (
    <div className="dashboard-parchment-bg w-full">
      <DashboardStatusBand
        isCompliant={isCompliant}
        needsAttention={needsAttention}
      />

      <section className="dashboard-stats-band px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {statItems.map((item) => (
            <div key={item.label} className="dashboard-warm-card px-5 py-10 text-center">
              <div className="dashboard-warm-card-content">
                <p className="font-serif text-4xl tracking-wide text-text sm:text-5xl lg:text-6xl">
                  {item.value}
                </p>
                <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.22em] text-leather">
                  {item.label}
                </p>
                <p className="mt-2 text-[11px] italic text-tan">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-parchment-bg px-8 sm:px-12 lg:px-16">
        <div className="grid overflow-hidden lg:grid-cols-[45%_55%]">
          <div className="relative h-[280px] overflow-hidden">
            <Image
              src="/ben-elliott-8WJtlR3nlQY-unsplash.jpg"
              alt=""
              fill
              className="object-cover object-[38%_center]"
              sizes="45vw"
            />
          </div>

          <div className="dashboard-cottage-panel flex flex-col justify-center border-t border-gold px-8 py-12 sm:px-10 lg:border-t-0 lg:border-l lg:px-14 lg:py-10">
            <p className="max-w-md font-serif text-2xl leading-snug tracking-wide text-raspberry sm:text-[1.65rem]">
              Every property. Every deadline. Every time.
            </p>
            <p className="mt-4 max-w-sm text-sm text-leather">
              Every certificate tracked. Every deadline met.
            </p>
            <Link href="/reminders" className={`${btnGoldClassName} mt-8 w-fit text-[11px]`}>
              View Reminders →
            </Link>
          </div>
        </div>
      </section>

      <section
        className="dashboard-portfolio-divider mt-12 flex h-20 flex-col items-center justify-center"
        aria-label="Property portfolio"
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-dusty-cream">
          Your Property Portfolio
        </p>
        <div className="mt-2 h-px w-10 bg-gold" aria-hidden="true" />
      </section>

      <section className="dashboard-parchment-bg px-8 pb-20 pt-12 sm:px-12 sm:pb-24 lg:px-16 lg:pb-28">
        <DashboardPortfolio
          properties={
            propertiesWithStatus as (Property & { status: ComplianceStatus })[]
          }
        />
      </section>
    </div>
  );
}
