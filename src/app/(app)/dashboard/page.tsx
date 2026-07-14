import Link from "next/link";
import OverviewHeroCarousel from "@/components/dashboard/OverviewHeroCarousel";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { buildOverviewData } from "@/lib/overview";
import { siteImages } from "@/lib/site-images";
import { editorialPagePaddingClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export const revalidate = 30;

export default async function OverviewDashboardPage() {
  const supabase = await createClient();

  const [{ data: properties }, { data: tenancies }] = await Promise.all([
    supabase.from("properties").select("*").order("created_at", { ascending: false }),
    supabase.from("tenancies").select("*").order("created_at", { ascending: false }),
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

  const { stats, actions } = buildOverviewData({
    properties: propertyList,
    certificates,
    tenancies: tenancyList,
  });

  const actionsOk = stats.urgentCount === 0;
  const complianceOk = stats.immediateComplianceCount === 0;
  const tenancyOk = stats.immediateTenancyCount === 0;

  const compliantCount = Math.max(
    0,
    stats.totalProperties - stats.complianceNeedsAttention
  );
  const portfolioStatus = actionsOk
    ? "Everything in order"
    : stats.urgentCount === 1
      ? "1 item needs attention"
      : `${stats.urgentCount} need attention`;

  const carouselPanels = [
    {
      id: "compliance",
      href: "/compliance",
      label: "Compliance",
      value: String(stats.immediateComplianceCount),
      detail: complianceOk ? "All clear" : "Needs attention",
    },
    {
      id: "tenancy",
      href: "/tenancy/dashboard",
      label: "Tenancy",
      value: String(stats.immediateTenancyCount),
      detail: tenancyOk ? "All current" : "Needs attention",
    },
    {
      id: "actions",
      href: "#todays-actions",
      label: "Actions",
      value: String(stats.urgentCount),
      detail: actionsOk ? "Nothing urgent" : "Act this week",
    },
    {
      id: "assistant",
      href: "/assistant",
      label: "Assistant",
      labelColor: "study" as const,
      value: "Your Personal Assistant",
      valueSize: "phrase" as const,
      footer: "Open →",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-[#F2EDE8] text-umber">
      <section className="relative h-[calc((100vh-4rem)*0.85)] min-h-[440px] w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: siteImages.lukeGalloway.placeholderColor }}
          aria-hidden
        >
          <OptimizedFillImage
            image={siteImages.lukeGalloway}
            alt=""
            sizes="100vw"
            priority
            quality={60}
            className="object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(61, 43, 31, 0.45)" }}
            aria-hidden
          />
        </div>

        <OverviewHeroCarousel panels={carouselPanels} />
      </section>

      <section
        id="todays-actions"
        className={`scroll-mt-20 bg-[#F2EDE8] ${editorialPagePaddingClassName} py-14`}
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-[#6B503C]">
          Action Required
        </p>
        <div className="mt-3 h-px w-16 bg-[#C4A35A]/80" aria-hidden />

        {actions.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <span
              className="flex h-10 w-10 items-center justify-center text-2xl text-[#C4A35A]"
              aria-hidden
            >
              ✓
            </span>
            <p className="mt-5 font-serif text-xl italic tracking-wide text-[#3D2B1F]">
              Your portfolio is in order.
            </p>
          </div>
        ) : (
          <ul className="mt-10">
            {actions.map((item) => {
              const overdue = item.daysRemaining < 0;
              const soon = !overdue && item.daysRemaining <= 7;
              const daysColour = overdue
                ? "text-urgent"
                : soon
                  ? "text-attention"
                  : "text-[#6B503C]";
              const dotColour =
                item.module === "compliance" ? "bg-[#33181C]" : "bg-[#1B2A4A]";

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-[#C5AC91]/70 py-5 transition hover:bg-[#EDE6DF]/70 sm:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:gap-6"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 ${dotColour}`}
                      aria-hidden
                    />
                    <div className="min-w-0 sm:contents">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-[17px] tracking-wide text-[#3D2B1F]">
                          {item.address}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-[#6B503C]">
                          {item.typeLabel}
                        </p>
                      </div>
                      <p className="mt-1 min-w-0 truncate text-[13px] italic text-cocoa sm:mt-0">
                        {item.actionLabel}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-right text-lg font-semibold tabular-nums ${daysColour}`}
                    >
                      {overdue
                        ? Math.abs(item.daysRemaining)
                        : item.daysRemaining}
                      <span className="ml-0.5 text-[11px] font-normal uppercase tracking-wide">
                        d
                      </span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid w-full grid-cols-1 md:grid-cols-[40%_60%]">
        <div
          className="relative min-h-[300px] overflow-hidden md:min-h-[420px]"
          style={{ backgroundColor: siteImages.sajeerMoCastle.placeholderColor }}
        >
          <OptimizedFillImage
            image={siteImages.sajeerMoCastle}
            alt=""
            sizes="(max-width: 768px) 100vw, 40vw"
            quality={60}
            className="object-cover"
            style={{ objectPosition: "center 30%" }}
          />
        </div>

        <div className="flex flex-col justify-center bg-[#F2EDE8] px-8 py-14 sm:px-12 lg:px-16 xl:px-20">
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-[#6B503C]">
            Your Portfolio at a Glance
          </p>
          <div className="mt-3 h-px w-16 bg-[#C4A35A]/80" aria-hidden />

          <dl className="mt-10">
            {(
              [
                ["Properties", String(stats.totalProperties)],
                ["Tenancies", String(stats.activeTenancies)],
                ["Compliant", String(compliantCount)],
                ["Status", portfolioStatus],
              ] as const
            ).map(([label, value], index) => (
              <div
                key={label}
                className={`grid grid-cols-[7.5rem_1fr] items-baseline gap-6 py-4 sm:grid-cols-[9rem_1fr] ${
                  index < 3 ? "border-b border-[#C5AC91]/70" : ""
                }`}
              >
                <dt className="text-[10px] font-normal uppercase tracking-[0.2em] text-[#6B503C]">
                  {label}
                </dt>
                <dd
                  className={`font-serif tracking-wide text-[#3D2B1F] ${
                    label === "Status"
                      ? "text-xl sm:text-2xl"
                      : "text-3xl sm:text-4xl"
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/compliance"
              className="text-sm text-[#33181C] transition hover:opacity-80"
            >
              View Compliance →
            </Link>
            <span className="h-4 w-px bg-[#C5AC91]" aria-hidden />
            <Link
              href="/tenancy/dashboard"
              className="text-sm text-[#1B2A4A] transition hover:opacity-80"
            >
              View Tenancy →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
