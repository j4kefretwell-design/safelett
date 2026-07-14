import Link from "next/link";
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

  const { stats, actions, activity } = buildOverviewData({
    properties: propertyList,
    certificates,
    tenancies: tenancyList,
  });

  const everythingInOrder =
    stats.attentionCount === 0 && stats.overdueItems === 0;

  const attentionValue = stats.attentionCount || stats.overdueItems;

  const statCards = [
    {
      label: "Total Properties",
      value: stats.totalProperties,
      description: "Across your portfolio",
    },
    {
      label: "Active Tenancies",
      value: stats.activeTenancies,
      description: "Currently let",
    },
    {
      label: "Expiring This Month",
      value: stats.expiringThisMonth,
      description: "Certificates and tenancy dates",
    },
    {
      label: "Overdue Items",
      value: stats.overdueItems,
      description: "Requiring immediate attention",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-greige text-umber">
      <section
        className="relative h-[220px] w-full overflow-hidden"
        style={{ backgroundColor: "#3D2B1F" }}
      >
        <OptimizedFillImage
          image={siteImages.hugoKruip}
          alt=""
          sizes="100vw"
          priority
          quality={60}
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
        />
        <div className="absolute inset-0 bg-umber/50" aria-hidden />

        <div className="absolute bottom-5 left-4 z-10 max-w-md bg-umber px-6 py-5 sm:bottom-8 sm:left-6 sm:max-w-sm sm:px-8 sm:py-6 lg:left-12">
          <div className="h-px w-10 bg-gold" aria-hidden />
          <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.28em] text-gold">
            Portfolio Status
          </p>
          <h1 className="mt-4 font-serif text-[1.125rem] font-normal leading-snug tracking-wide text-greige sm:text-[1.35rem]">
            {everythingInOrder
              ? "Everything in Order"
              : `${attentionValue} ${
                  attentionValue === 1
                    ? "Item Needs Attention"
                    : "Items Need Attention"
                }`}
          </h1>
        </div>
      </section>

      <section className={`${editorialPagePaddingClassName} py-12`}>
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="overview-stat-card relative flex h-full flex-col overflow-hidden border border-sand border-t-[3px] border-t-gold px-5 py-9 text-center shadow-[0_2px_8px_rgba(61,43,31,0.08)]"
              style={{
                background:
                  "linear-gradient(165deg, #EDE6DF 0%, #E5DAD0 100%)",
              }}
            >
              <div className="relative z-[1]">
                <p className="font-serif text-4xl tracking-wide text-umber sm:text-5xl">
                  {card.value}
                </p>
                <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.2em] text-leather">
                  {card.label}
                </p>
                <p className="mt-2 text-[11px] font-light leading-relaxed text-tan">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-umber py-12">
        <div className={editorialPagePaddingClassName}>
          <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-dusty-cream">
            Action Required
          </p>
          <div className="mt-3 h-px w-24 bg-gold/60" aria-hidden />

          {actions.length === 0 ? (
            <p className="mt-12 flex items-center justify-center gap-3 text-center text-[15px] italic text-dusty-cream">
              <span className="not-italic text-gold" aria-hidden>
                ✓
              </span>
              Your portfolio is in good order.
            </p>
          ) : (
            <ul className="mt-8">
              {actions.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-5 border-l-[3px] px-5 py-6 transition hover:bg-white/[0.04] sm:px-6 ${
                      item.module === "compliance"
                        ? "border-l-raspberry"
                        : "border-l-[#8BA3C7]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[17px] tracking-wide text-dusty-cream">
                        {item.address}
                      </p>
                      <p className="mt-1.5 text-sm text-sand">{item.detail}</p>
                    </div>
                    <p className="shrink-0 text-sm font-normal tabular-nums text-gold">
                      {item.daysRemaining < 0
                        ? `${Math.abs(item.daysRemaining)}d overdue`
                        : `${item.daysRemaining}d`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={`${editorialPagePaddingClassName} py-12`}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="border border-sand/60 border-t-[2px] border-t-raspberry bg-[#F5EDE5] px-6 py-10 shadow-[0_2px_8px_rgba(61,43,31,0.08)] sm:px-8">
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-raspberry">
              Compliance
            </p>
            <p className="mt-5 font-serif text-3xl text-umber">
              {stats.totalProperties}
            </p>
            <p className="mt-1 text-sm text-leather">
              {stats.totalProperties === 1 ? "property" : "properties"}
            </p>
            <p className="mt-4 text-sm text-leather">
              {stats.complianceExpiringSoon} expiring soon
            </p>
            <Link
              href="/compliance"
              className="mt-6 inline-block text-sm text-raspberry transition hover:text-umber"
            >
              View Compliance →
            </Link>
          </div>

          <div className="border border-sand/40 border-t-[2px] border-t-navy bg-[#EDF0F5] px-6 py-10 shadow-[0_2px_8px_rgba(61,43,31,0.08)] sm:px-8">
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-navy">
              Tenancy
            </p>
            <p className="mt-5 font-serif text-3xl text-navy">
              {stats.activeTenancies}
            </p>
            <p className="mt-1 text-sm text-steel">
              {stats.activeTenancies === 1
                ? "active tenancy"
                : "active tenancies"}
            </p>
            <p className="mt-4 text-sm text-steel">
              {stats.tenancyRenewalsDue}{" "}
              {stats.tenancyRenewalsDue === 1 ? "renewal due" : "renewals due"}
            </p>
            <Link
              href="/tenancy/dashboard"
              className="mt-6 inline-block text-sm text-navy transition hover:text-navy-dark"
            >
              View Tenancy →
            </Link>
          </div>
        </div>
      </section>

      <section
        className="relative h-[180px] w-full overflow-hidden"
        style={{ backgroundColor: siteImages.benElliottHero.placeholderColor }}
      >
        <OptimizedFillImage
          image={siteImages.benElliottHero}
          alt=""
          sizes="100vw"
          quality={60}
          className="object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-umber/30" aria-hidden />
      </section>

      <section className={`${editorialPagePaddingClassName} py-12`}>
        <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-umber">
          Recent Activity
        </p>
        <div className="mt-3 h-px w-24 bg-gold/70" aria-hidden />

        {activity.length === 0 ? (
          <p className="mt-8 text-sm text-leather">
            Activity will appear here as you manage your portfolio.
          </p>
        ) : (
          <ul className="mt-8">
            {activity.map((item, index) => (
              <li
                key={item.id}
                className={`grid grid-cols-[7.5rem_1fr] items-baseline gap-6 border-l-[3px] border-l-gold px-5 py-5 sm:grid-cols-[9rem_1fr] sm:px-6 ${
                  index % 2 === 0 ? "bg-greige" : "bg-greige-alt"
                }`}
              >
                <span className="text-xs text-leather">{item.dateLabel}</span>
                <span className="font-serif text-[15px] tracking-wide text-umber">
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
