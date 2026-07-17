import Link from "next/link";
import { Suspense } from "react";
import DashboardCottageImage from "@/components/dashboard/DashboardCottageImage";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import DashboardPortfolioActions from "@/components/DashboardPortfolioActions";
import RoutePrefetcher from "@/components/RoutePrefetcher";
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
    return (
      <>
        <RoutePrefetcher paths={["/properties/new", "/reminders"]} />
        <DashboardEmptyState />
      </>
    );
  }

  return (
    <div className="dashboard-parchment-bg w-full min-w-0 overflow-x-hidden">
      <RoutePrefetcher paths={["/properties/new", "/reminders"]} />
      <DashboardStatusBand
        total={stats.total}
        compliant={stats.compliant}
        attention={stats.attention}
        overdue={stats.overdue}
      />

      <section className={`dashboard-parchment-bg ${editorialPagePaddingClassName}`}>
        <div className="grid min-w-0 overflow-hidden lg:grid-cols-[45%_55%]">
          <div className="hidden lg:block">
            <DashboardCottageImage />
          </div>

          <div className="dashboard-cottage-panel flex flex-col justify-center border-t border-gold px-6 py-10 sm:px-10 lg:border-t-0 lg:border-l lg:px-14 lg:py-10">
            <p className="max-w-md font-serif text-xl leading-snug tracking-wide text-heading sm:text-2xl lg:text-[1.65rem]">
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
        <Suspense fallback={null}>
          <DashboardPortfolio
            properties={
              propertiesWithStatus as (Property & { status: ComplianceStatus })[]
            }
          />
        </Suspense>
      </section>
    </div>
  );
}
