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

  const portfolioSummary = actionsOk
    ? "Nothing needs your attention right now."
    : stats.urgentCount === 1
      ? "1 item needs attention this week."
      : `${stats.urgentCount} items need attention this week.`;

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
      labelAccent: "gold" as const,
      value: String(stats.urgentCount),
      detail: actionsOk ? "Nothing urgent" : "Act this week",
    },
    {
      id: "assistant",
      href: "/assistant",
      label: "Assistant",
      value: "Ready",
      detail: "Ask or draft",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-greige text-umber">
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
        className={`scroll-mt-20 bg-greige ${editorialPagePaddingClassName} py-12`}
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-umber">
          Today&apos;s Actions
        </p>
        <div className="mt-3 h-px w-24 bg-gold/70" aria-hidden />

        {actions.length === 0 ? (
          <p className="mt-10 flex items-center gap-3 text-[15px] font-light text-umber">
            <span className="text-gold" aria-hidden>
              ✓
            </span>
            Nothing needs your attention right now.
          </p>
        ) : (
          <ul className="mt-8">
            {actions.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-5 border-l-[3px] border-l-gold px-5 py-5 transition hover:bg-greige-alt/80 sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[17px] tracking-wide text-umber">
                      {item.address}
                    </p>
                    <p className="mt-1.5 text-sm text-leather">{item.detail}</p>
                  </div>
                  <p
                    className={`shrink-0 text-sm tabular-nums ${
                      item.daysRemaining < 0 ? "text-raspberry" : "text-leather"
                    }`}
                  >
                    {item.daysRemaining < 0
                      ? `${Math.abs(item.daysRemaining)}d overdue`
                      : `${item.daysRemaining}d`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="my-12 grid w-full grid-cols-1 md:grid-cols-[45%_55%]">
        <div
          className="relative min-h-[280px] overflow-hidden md:min-h-[360px]"
          style={{ backgroundColor: siteImages.rummanAmin.placeholderColor }}
        >
          <OptimizedFillImage
            image={siteImages.rummanAmin}
            alt=""
            sizes="(max-width: 768px) 100vw, 45vw"
            quality={60}
            className="object-cover"
            style={{ objectPosition: "center 30%" }}
          />
        </div>

        <div className="flex flex-col justify-center bg-[#F2EDE8] px-8 py-12 sm:px-12 lg:px-16">
          <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-gold">
            Your portfolio at a glance
          </p>

          <div className="mt-8 space-y-5">
            <p className="font-serif text-4xl tracking-wide text-umber sm:text-5xl">
              {stats.totalProperties}
              <span className="ml-3 text-base font-sans tracking-normal text-leather">
                {stats.totalProperties === 1 ? "property" : "properties"}
              </span>
            </p>
            <p className="font-serif text-4xl tracking-wide text-umber sm:text-5xl">
              {stats.totalTenancies}
              <span className="ml-3 text-base font-sans tracking-normal text-leather">
                {stats.totalTenancies === 1 ? "tenancy" : "tenancies"}
              </span>
            </p>
          </div>

          <div className="mt-8 h-px w-20 bg-gold/70" aria-hidden />

          <p className="mt-6 text-[15px] font-light leading-relaxed text-umber">
            {portfolioSummary}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/compliance"
              className="text-sm text-raspberry transition hover:text-umber"
            >
              View Compliance →
            </Link>
            <Link
              href="/tenancy/dashboard"
              className="text-sm text-navy transition hover:text-navy-dark"
            >
              View Tenancy →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
