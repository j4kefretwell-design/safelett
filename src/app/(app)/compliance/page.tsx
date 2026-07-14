import Link from "next/link";
import DashboardCottageImage from "@/components/dashboard/DashboardCottageImage";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import DashboardPortfolioActions from "@/components/DashboardPortfolioActions";
import { getPropertyStatus } from "@/lib/compliance";
import { btnGoldClassName, editorialPagePaddingClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, ComplianceStatus, Property } from "@/lib/types";
import DashboardPortfolio from "./DashboardPortfolio";
import DashboardStatusBand from "./DashboardStatusBand";

export const revalidate = 30;

export default async function ComplianceDashboardPage() {
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
    <div className="dashboard-parchment-bg w-full min-w-0 overflow-x-hidden">
      <DashboardStatusBand
        isCompliant={isCompliant}
        needsAttention={needsAttention}
      />

      <section className={`dashboard-stats-band ${editorialPagePaddingClassName} py-12`}>
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {statItems.map((item) => (
            <div key={item.label} className="dashboard-warm-card flex h-full flex-col px-5 py-10 text-center">
              <div className="dashboard-warm-card-content">
                <p className="font-serif text-4xl tracking-wide text-text sm:text-5xl lg:text-6xl">
                  {item.value}
                </p>
                <p className="mt-4 caps-label text-leather">
                  {item.label}
                </p>
                <p className="mt-2 text-sm italic leading-relaxed text-tan">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`dashboard-parchment-bg ${editorialPagePaddingClassName}`}>
        <div className="grid min-w-0 overflow-hidden lg:grid-cols-[45%_55%]">
          <DashboardCottageImage />

          <div className="dashboard-cottage-panel flex flex-col justify-center border-t border-gold px-6 py-10 sm:px-10 lg:border-t-0 lg:border-l lg:px-14 lg:py-10">
            <p className="max-w-md font-serif text-xl leading-snug tracking-wide text-raspberry sm:text-2xl lg:text-[1.65rem]">
              Every property. Every deadline. Every time.
            </p>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-leather">
              Every certificate tracked. Every deadline met.
            </p>
            <Link href="/reminders" className={`${btnGoldClassName} mt-8 w-full sm:w-fit`}>
              View Reminders →
            </Link>
          </div>
        </div>
      </section>

      <section
        className="dashboard-portfolio-divider mt-12 flex h-20 flex-col items-center justify-center"
        aria-label="Property portfolio"
      >
        <p className="caps-label text-dusty-cream">
          Your Property Portfolio
        </p>
        <div className="mt-2 h-px w-10 bg-gold" aria-hidden="true" />
      </section>

      <section className={`dashboard-parchment-bg ${editorialPagePaddingClassName} pb-16 pt-10 sm:pb-24 lg:pb-28`}>
        <div className="mb-8 flex justify-end">
          <DashboardPortfolioActions />
        </div>
        <DashboardPortfolio
          properties={
            propertiesWithStatus as (Property & { status: ComplianceStatus })[]
          }
        />
      </section>
    </div>
  );
}
