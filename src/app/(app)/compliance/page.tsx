import Link from "next/link";
import { Suspense } from "react";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import DashboardCottageImage from "@/components/dashboard/DashboardCottageImage";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import DashboardPortfolioActions from "@/components/DashboardPortfolioActions";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import { getPropertyStatus } from "@/lib/compliance";
import { IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import { btnGoldClassName, editorialPagePaddingClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, ComplianceStatus, Property } from "@/lib/types";
import DashboardPortfolio from "./DashboardPortfolio";
import DashboardStatusBand, {
  DashboardStatsRow,
} from "./DashboardStatusBand";

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

      const certificateList = (certificates ?? []) as Pick<
        Certificate,
        "expiry_date"
      >[];
      const status = getPropertyStatus(certificateList);
      const nextExpiry =
        certificateList
          .map((certificate) => certificate.expiry_date)
          .filter((date): date is string => Boolean(date))
          .sort()[0] ?? null;

      return { ...property, status, nextExpiry };
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
      <section
        className="relative flex w-full flex-col overflow-hidden"
        style={{ minHeight: "55vh", backgroundColor: "#33181C" }}
      >
        <OptimizedFillImage
          image={siteImages.anthonyFomin}
          alt=""
          sizes="100vw"
          priority
          quality={IMAGE_QUALITY}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#33181C]/40" aria-hidden="true" />
        <DashboardStatusBand
          total={stats.total}
          compliant={stats.compliant}
          attention={stats.attention}
          overdue={stats.overdue}
        />
      </section>
      <DashboardStatsRow
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
        className={`dashboard-parchment-bg ${editorialPagePaddingClassName} pb-16 pt-20 sm:pb-24 sm:pt-24 lg:pb-28`}
        aria-label="Property portfolio"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p
              className="text-[10px] font-normal uppercase tracking-[0.28em]"
              style={{ color: "#60544D" }}
            >
              Your Properties
            </p>
            <div
              className="mt-3 h-px w-12"
              style={{ backgroundColor: "#C4A35A" }}
              aria-hidden="true"
            />
          </div>
          <DashboardPortfolioActions />
        </div>
        <Suspense fallback={null}>
          <DashboardPortfolio
            properties={
              propertiesWithStatus as (Property & {
                status: ComplianceStatus;
                nextExpiry: string | null;
              })[]
            }
          />
        </Suspense>
      </section>
    </div>
  );
}
