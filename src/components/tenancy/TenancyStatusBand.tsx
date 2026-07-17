"use client";

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
    <div
      className={`relative z-10 flex w-full flex-1 items-center py-8 sm:py-12 ${editorialPagePaddingClassName}`}
    >
        <div
          className="grid w-full grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1.25rem", minHeight: "60vh" }}
        >
          {cards.map((card) => (
            <div
              key={card.status}
              className="flex min-h-0 flex-col p-6 text-center sm:p-10"
              style={{
                borderRadius: "16px",
                border: "1px solid #C4A35A",
                backgroundColor: "rgba(240,236,225,0.94)",
                boxShadow:
                  "0 0 0 1px rgba(196,164,90,0.4), 0 8px 32px rgba(0,0,0,0.2)",
              }}
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
  );
}
