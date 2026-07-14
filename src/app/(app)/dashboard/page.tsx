import Link from "next/link";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { buildOverviewData } from "@/lib/overview";
import { siteImages } from "@/lib/site-images";
import { editorialPagePaddingClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export const revalidate = 30;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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
    stats.urgentCount === 0 && stats.overdueItems === 0;

  const attentionValue = stats.urgentCount || stats.overdueItems;
  const complianceOk = stats.complianceNeedsAttention === 0;
  const tenancyOk = stats.tenancyRenewalsDue === 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-greige text-umber">
      {/* Greeting header */}
      <section className={`bg-greige ${editorialPagePaddingClassName} py-12 sm:py-14`}>
        <h1 className="font-serif text-3xl tracking-wide text-umber sm:text-4xl">
          {greeting()}
        </h1>
        <p className="mt-4 font-serif text-lg tracking-wide text-umber/85 sm:text-xl">
          {everythingInOrder
            ? "Everything in order across your portfolio."
            : `${attentionValue} ${
                attentionValue === 1
                  ? "item needs your attention."
                  : "items need your attention."
              }`}
        </p>
      </section>

      {/* Four action blocks — flush full-width row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/compliance"
          className="flex h-[160px] flex-col justify-between bg-umber p-5 transition hover:brightness-110 sm:p-6"
        >
          <div>
            <span
              className="mb-3 inline-block h-1.5 w-1.5 bg-raspberry"
              aria-hidden
            />
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-dusty-cream">
              Compliance
            </p>
            <p className="mt-3 font-serif text-3xl tracking-wide text-dusty-cream">
              {stats.totalProperties}
            </p>
            <p
              className={`mt-2 text-sm ${
                complianceOk ? "text-compliant" : "text-attention"
              }`}
            >
              {complianceOk
                ? "All Compliant"
                : `${stats.complianceNeedsAttention} Need Attention`}
            </p>
          </div>
          <p className="text-right text-sm text-gold">View →</p>
        </Link>

        <Link
          href="/tenancy/dashboard"
          className="flex h-[160px] flex-col justify-between bg-[#2C3E5C] p-5 transition hover:brightness-110 sm:p-6"
        >
          <div>
            <span
              className="mb-3 inline-block h-1.5 w-1.5 bg-navy"
              aria-hidden
            />
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-dusty-cream">
              Tenancy
            </p>
            <p className="mt-3 font-serif text-3xl tracking-wide text-dusty-cream">
              {stats.totalTenancies}
            </p>
            <p
              className={`mt-2 text-sm ${
                tenancyOk ? "text-compliant" : "text-attention"
              }`}
            >
              {tenancyOk
                ? "All Current"
                : `${stats.tenancyRenewalsDue} Due for Renewal`}
            </p>
          </div>
          <p className="text-right text-sm text-gold">View →</p>
        </Link>

        <Link
          href="#todays-actions"
          className="flex h-[160px] flex-col justify-between bg-gold p-5 transition hover:brightness-105 sm:p-6"
        >
          <div>
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-umber">
              Actions
            </p>
            <p className="mt-3 font-serif text-3xl tracking-wide text-umber">
              {stats.urgentCount}
            </p>
            <p className="mt-2 text-sm text-umber/80">
              Items need attention today
            </p>
          </div>
          <p className="text-right text-sm text-umber">View All →</p>
        </Link>

        <Link
          href="/assistant"
          className="flex h-[160px] flex-col justify-between bg-study p-5 transition hover:brightness-110 sm:p-6"
        >
          <div>
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-dusty-cream">
              Assistant
            </p>
            <p className="mt-4 max-w-[12rem] text-sm leading-relaxed text-dusty-cream/90">
              Ask a question or draft a document
            </p>
          </div>
          <p className="text-right text-sm text-moss">Open →</p>
        </Link>
      </section>

      {/* Today's Actions */}
      <section id="todays-actions" className="scroll-mt-20 bg-umber py-12">
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

      {/* Mid-page cottage strip */}
      <section
        className="relative h-[200px] w-full overflow-hidden"
        style={{ backgroundColor: "#3D2B1F" }}
      >
        <OptimizedFillImage
          image={siteImages.hugoKruip}
          alt=""
          sizes="100vw"
          quality={60}
          className="object-cover"
          style={{ objectPosition: "center 65%" }}
        />
        <div className="absolute inset-0 bg-umber/30" aria-hidden />
      </section>

      {/* Quick access */}
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

      {/* Recent activity */}
      <section className={`${editorialPagePaddingClassName} pb-16`}>
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
