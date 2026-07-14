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

  const complianceOk = stats.complianceNeedsAttention === 0;
  const tenancyOk = stats.tenancyRenewalsDue === 0;
  const actionsOk = stats.urgentCount === 0;

  const panelClass =
    "flex min-h-[200px] flex-1 flex-col justify-between bg-[rgba(240,236,225,0.94)] p-9 shadow-[0_4px_20px_rgba(61,43,31,0.14)] sm:min-h-[220px]";

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-greige text-umber">
      {/* Full-viewport hero */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[520px] w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#3D2B1F" }}
          aria-hidden
        >
          <OptimizedFillImage
            image={siteImages.hugoKruip}
            alt=""
            sizes="100vw"
            priority
            quality={60}
            className="object-cover"
            style={{ objectPosition: "center 65%" }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(61, 43, 31, 0.45)" }}
            aria-hidden
          />
        </div>

        {/* Floating band — dominant boxes over backdrop */}
        <div className="absolute inset-x-0 top-1/2 z-[1] flex h-[82%] w-full -translate-y-1/2 flex-col gap-3 px-3 sm:flex-row sm:px-4 lg:px-6">
          <Link href="/compliance" className={panelClass}>
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-umber">
                Compliance
              </p>
              <p className="mt-5 font-serif text-3xl tracking-wide text-umber sm:text-4xl lg:text-5xl">
                {stats.totalProperties}
              </p>
              <p className="mt-3 text-base text-leather">
                {complianceOk
                  ? "All compliant"
                  : `${stats.complianceNeedsAttention} expiring`}
              </p>
            </div>
          </Link>

          <Link href="/tenancy/dashboard" className={panelClass}>
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-umber">
                Tenancy
              </p>
              <p className="mt-5 font-serif text-3xl tracking-wide text-umber sm:text-4xl lg:text-5xl">
                {stats.totalTenancies}
              </p>
              <p className="mt-3 text-base text-leather">
                {tenancyOk
                  ? "All current"
                  : `${stats.tenancyRenewalsDue} renewing soon`}
              </p>
            </div>
          </Link>

          <Link href="#todays-actions" className={panelClass}>
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-gold">
                Actions
              </p>
              <p className="mt-5 font-serif text-3xl tracking-wide text-umber sm:text-4xl lg:text-5xl">
                {stats.urgentCount}
              </p>
              <p className="mt-3 text-base text-leather">
                {actionsOk ? "Nothing urgent" : "Items need attention"}
              </p>
            </div>
          </Link>

          <Link href="/assistant" className={panelClass}>
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-umber">
                Assistant
              </p>
              <p className="mt-5 font-serif text-3xl tracking-wide text-umber sm:text-4xl">
                Ready to help
              </p>
            </div>
            <p className="mt-4 text-base text-gold">Open →</p>
          </Link>
        </div>
      </section>

      {/* Light content below hero */}
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
            Your portfolio is in good order.
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

      <section className={`${editorialPagePaddingClassName} pb-4`}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="border border-sand/50 border-t-[2px] border-t-raspberry bg-[#F5EDE5] px-6 py-9 sm:px-8">
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-raspberry">
              Compliance
            </p>
            <p className="mt-4 font-serif text-3xl text-umber">
              {stats.totalProperties}
            </p>
            <p className="mt-1 text-sm text-leather">
              {stats.totalProperties === 1 ? "property" : "properties"}
            </p>
            <p className="mt-3 text-sm text-leather">
              {stats.complianceExpiringSoon} expiring soon
            </p>
            <Link
              href="/compliance"
              className="mt-5 inline-block text-sm text-raspberry transition hover:text-umber"
            >
              View Compliance →
            </Link>
          </div>

          <div className="border border-sand/40 border-t-[2px] border-t-navy bg-[#EDF0F5] px-6 py-9 sm:px-8">
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-navy">
              Tenancy
            </p>
            <p className="mt-4 font-serif text-3xl text-navy">
              {stats.activeTenancies}
            </p>
            <p className="mt-1 text-sm text-steel">
              {stats.activeTenancies === 1
                ? "active tenancy"
                : "active tenancies"}
            </p>
            <p className="mt-3 text-sm text-steel">
              {stats.tenancyRenewalsDue}{" "}
              {stats.tenancyRenewalsDue === 1 ? "renewal due" : "renewals due"}
            </p>
            <Link
              href="/tenancy/dashboard"
              className="mt-5 inline-block text-sm text-navy transition hover:text-navy-dark"
            >
              View Tenancy →
            </Link>
          </div>
        </div>
      </section>

      <section
        className="relative my-12 h-[160px] w-full overflow-hidden"
        style={{ backgroundColor: siteImages.rummanAmin.placeholderColor }}
      >
        <OptimizedFillImage
          image={siteImages.rummanAmin}
          alt=""
          sizes="100vw"
          quality={60}
          className="object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-umber/25" aria-hidden />
      </section>

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
