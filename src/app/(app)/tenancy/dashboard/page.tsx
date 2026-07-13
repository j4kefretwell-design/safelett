import Link from "next/link";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import TenancyEmptyState from "@/components/tenancy/TenancyEmptyState";
import TenancyPortfolio from "@/components/tenancy/TenancyPortfolio";
import TenancyStatusBand from "@/components/tenancy/TenancyStatusBand";
import { siteImages } from "@/lib/site-images";
import {
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  type Tenancy,
} from "@/lib/tenancy";
import { btnGoldClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";

export default async function TenancyDashboardPage() {
  const supabase = await createClient();

  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("*")
    .order("end_date", { ascending: true });

  const tenancyList = (tenancies ?? []) as Tenancy[];

  if (tenancyList.length === 0) {
    return <TenancyEmptyState />;
  }

  const activeCount = tenancyList.filter(
    (tenancy) => getTenancyStatus(tenancy) === "active"
  ).length;

  const renewalsDue = tenancyList.filter((tenancy) => {
    const status = getTenancyStatus(tenancy);
    return status === "renewal_due" || status === "expired";
  }).length;

  const rentReviewsDue = tenancyList.filter((tenancy) => {
    if (!tenancy.rent_review_date) return false;
    const days = getDaysUntilDate(tenancy.rent_review_date);
    return days <= 60 && days >= 0;
  }).length;

  const depositsUnprotected = tenancyList.filter(isDepositProtectionOverdue).length;

  const statItems = [
    {
      label: "Total Tenancies",
      value: tenancyList.length,
      description: "Across your portfolio",
    },
    {
      label: "Renewals Due",
      value: renewalsDue,
      description: "Ending or expired",
    },
    {
      label: "Rent Reviews Due",
      value: rentReviewsDue,
      description: "Within 60 days",
    },
    {
      label: "Deposits Unprotected",
      value: depositsUnprotected,
      description: "Requires attention",
    },
  ];

  return (
    <div className="tenancy-slate-bg w-full min-w-0 overflow-x-hidden">
      <TenancyStatusBand
        activeCount={activeCount}
        renewalsDue={renewalsDue}
      />

      <section className="px-5 py-12 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {statItems.map((item) => (
            <div key={item.label} className="tenancy-card px-5 py-10 text-center">
              <p className="font-serif text-4xl tracking-wide text-tenancy-text sm:text-5xl lg:text-6xl">
                {item.value}
              </p>
              <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.18em] text-steel">
                {item.label}
              </p>
              <p className="mt-2 text-sm italic leading-relaxed text-steel/80">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-12 lg:px-16">
        <div className="grid min-w-0 overflow-hidden lg:grid-cols-[45%_55%]">
          <div
            className="relative min-h-[240px] overflow-hidden lg:min-h-[280px]"
            style={{ backgroundColor: siteImages.annieSprattTopiary.placeholderColor }}
          >
            <OptimizedFillImage
              image={siteImages.annieSprattTopiary}
              alt=""
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
              style={{ objectPosition: "center 75%" }}
            />
          </div>

          <div className="flex flex-col justify-center border-t border-gold/40 bg-[#F0F2F5] px-6 py-10 sm:px-10 lg:border-t-0 lg:border-l lg:border-gold/40 lg:px-14 lg:py-12">
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-navy">
              Your Tenancies
            </p>
            <h2 className="mt-4 max-w-md font-serif text-2xl leading-snug tracking-wide text-tenancy-text sm:text-[1.75rem]">
              Every deadline. Every tenant. Protected.
            </h2>
            <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-steel">
              Track renewals, rent reviews and deposit protection across your
              entire lettings portfolio.
            </p>
            <Link href="/reminders" className={`${btnGoldClassName} mt-8 w-full sm:w-fit`}>
              View Reminders →
            </Link>
          </div>
        </div>
      </section>

      <section
        className="tenancy-portfolio-divider mt-12 flex h-20 flex-col items-center justify-center"
        aria-label="Your tenancies"
      >
        <p className="caps-label text-dusty-cream">Your Tenancies</p>
        <div className="mt-2 h-px w-10 bg-gold" aria-hidden="true" />
      </section>

      <section className="px-5 pb-16 pt-10 sm:px-12 sm:pb-24 lg:px-16 lg:pb-28">
        <TenancyPortfolio tenancies={tenancyList} />
      </section>
    </div>
  );
}
