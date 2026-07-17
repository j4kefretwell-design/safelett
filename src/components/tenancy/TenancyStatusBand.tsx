"use client";

import OptimizedFillImage from "@/components/OptimizedFillImage";
import { IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import { editorialPagePaddingClassName } from "@/lib/ui";

interface TenancyStatusBandProps {
  total: number;
  renewalsDue: number;
  rentReviewsDue: number;
  depositsUnprotected: number;
}

export default function TenancyStatusBand({
  total,
  renewalsDue,
  rentReviewsDue,
  depositsUnprotected,
}: TenancyStatusBandProps) {
  function handleViewRenewals() {
    document.getElementById("tenancy-grid")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const cards = [
    {
      status: "Portfolio Overview",
      value: `${total} ${total === 1 ? "tenancy" : "tenancies"}`,
      description: "Across your portfolio",
      statusClass: "text-heading",
    },
    {
      status: "Renewals Due",
      value: `${renewalsDue} ending or expired`,
      description: "Review upcoming renewals",
      statusClass: renewalsDue > 0 ? "text-attention" : "text-compliant",
      actionable: renewalsDue > 0,
    },
    {
      status: "Rent Reviews Due",
      value: `${rentReviewsDue} within 60 days`,
      description: "Upcoming review dates",
      statusClass: rentReviewsDue > 0 ? "text-attention" : "text-compliant",
    },
    {
      status: "Deposit Protection",
      value: `${depositsUnprotected} unprotected`,
      description: depositsUnprotected > 0 ? "Immediate action required" : "All deposits protected",
      statusClass: depositsUnprotected > 0 ? "text-urgent" : "text-compliant",
    },
  ];

  return (
    <section className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-navy">
      <OptimizedFillImage
        image={siteImages.tenancyDashboardHero}
        alt="Chandelier and staircase seen through a Georgian window"
        sizes="100vw"
        priority
        quality={IMAGE_QUALITY}
        className="object-cover opacity-40"
        style={{ objectPosition: "center 35%" }}
      />
      <div className="absolute inset-0 bg-navy/50" aria-hidden="true" />

      <div className={`relative z-10 flex h-full items-center py-6 sm:py-10 ${editorialPagePaddingClassName}`}>
        <div className="grid h-full max-h-[640px] w-full grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.status}
              className="flex min-h-0 flex-col bg-vanilla p-6 text-center shadow-[inset_0_0_0_1px_rgba(196,164,90,0.3)] sm:p-10"
            >
              <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-navy">
                Tenancy
              </p>
              <div className="mx-auto mt-5 h-px w-10 bg-gold/70" aria-hidden="true" />
              <p className={`mt-auto font-display text-[clamp(1.3rem,2.5vw,1.8rem)] leading-tight tracking-wide ${card.statusClass}`}>
                {card.status}
              </p>
              <p className="mt-5 font-serif text-lg tracking-wide text-heading sm:text-xl">
                {card.value}
              </p>
              <p className="mt-2 text-xs italic leading-relaxed text-steel sm:text-sm">
                {card.description}
              </p>
              {card.actionable ? (
                <button
                  type="button"
                  onClick={handleViewRenewals}
                  className="mt-auto min-h-11 pt-4 text-[10px] font-normal uppercase tracking-[0.18em] text-gold-readable transition hover:text-gold"
                >
                  View tenancies →
                </button>
              ) : (
                <div className="mt-auto min-h-11" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
