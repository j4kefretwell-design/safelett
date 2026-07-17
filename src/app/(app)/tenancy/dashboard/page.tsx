import Link from "next/link";
import { Suspense } from "react";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import TenancyEmptyState from "@/components/tenancy/TenancyEmptyState";
import TenancyPortfolio from "@/components/tenancy/TenancyPortfolio";
import TenancyStatusBand from "@/components/tenancy/TenancyStatusBand";
import { CONTENT_IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import {
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  type Tenancy,
} from "@/lib/tenancy";
import { btnGoldClassName, editorialPagePaddingClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function TenancyDashboardPage() {
  const supabase = await createClient();

  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("*")
    .order("end_date", { ascending: true });

  const tenancyList = (tenancies ?? []) as Tenancy[];

  if (tenancyList.length === 0) {
    return (
      <>
        <RoutePrefetcher paths={["/tenancy/new", "/reminders"]} />
        <TenancyEmptyState />
      </>
    );
  }

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

  return (
    <div className="tenancy-slate-bg w-full min-w-0 overflow-x-hidden">
      <RoutePrefetcher paths={["/tenancy/new", "/reminders"]} />
      <TenancyStatusBand
        total={tenancyList.length}
        renewalsDue={renewalsDue}
        rentReviewsDue={rentReviewsDue}
        depositsUnprotected={depositsUnprotected}
      />

      <section className={editorialPagePaddingClassName}>
        <div className="grid min-w-0 overflow-hidden lg:grid-cols-[45%_55%]">
          <div
            className="relative hidden min-h-[280px] overflow-hidden lg:block"
            style={{ backgroundColor: siteImages.annieSprattTopiary.placeholderColor }}
          >
            <OptimizedFillImage
              image={siteImages.annieSprattTopiary}
              alt=""
              sizes="50vw"
              quality={CONTENT_IMAGE_QUALITY}
              className="object-cover"
              style={{ objectPosition: "center 75%" }}
            />
          </div>

          <div className="flex flex-col justify-center border-t border-gold/40 bg-vanilla px-6 py-10 sm:px-10 lg:border-t-0 lg:border-l lg:border-gold/40 lg:px-14 lg:py-12">
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-navy">
              Your Tenancies
            </p>
            <h2 className="mt-4 max-w-md font-serif text-2xl leading-snug tracking-wide text-heading sm:text-[1.75rem]">
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

      <section className={`${editorialPagePaddingClassName} pb-16 pt-10 sm:pb-24 lg:pb-28`}>
        <Suspense fallback={null}>
          <TenancyPortfolio tenancies={tenancyList} />
        </Suspense>
      </section>
    </div>
  );
}
