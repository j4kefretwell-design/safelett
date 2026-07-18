"use client";

interface TenancyStatusBandProps {
  total: number;
  renewalsDue: number;
  rentReviewsDue: number;
  depositsUnprotected: number;
}

export default function TenancyStatusBand({
  renewalsDue,
}: TenancyStatusBandProps) {
  return (
    <div
      className="absolute inset-x-4 bottom-4 z-10 max-w-md px-6 py-5 sm:inset-x-auto sm:bottom-10 sm:left-10 sm:max-w-sm sm:px-8 sm:py-6"
      style={{ backgroundColor: "rgba(27,35,57,0.85)" }}
    >
      <div className="h-px w-10 bg-gold" aria-hidden="true" />
      <p
        className="mt-4 text-[10px] font-normal uppercase tracking-[0.28em]"
        style={{ color: "#F8F4EE" }}
      >
        Tenancy Portfolio
      </p>
      <h1
        className="mt-4 font-display text-2xl font-normal leading-snug tracking-wide sm:text-3xl"
        style={{ color: "#F8F4EE" }}
      >
        {renewalsDue > 0
          ? `${renewalsDue} ${renewalsDue === 1 ? "Renewal" : "Renewals"} Due`
          : "All Tenancies in Good Standing"}
      </h1>
      <p
        className="mt-3 text-sm italic leading-relaxed"
        style={{ color: "#F8F4EE" }}
      >
        {renewalsDue > 0
          ? "Review the affected tenancies below."
          : "No immediate renewal action required."}
      </p>
    </div>
  );
}

export function TenancyStatsRow({
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
    },
    {
      status: "Renewals Due",
      value: `${renewalsDue} ending or expired`,
      description: "Review upcoming renewals",
      actionable: renewalsDue > 0,
    },
    {
      status: "Rent Reviews Due",
      value: `${rentReviewsDue} within 60 days`,
      description: "Upcoming review dates",
    },
    {
      status: "Deposit Protection",
      value: `${depositsUnprotected} unprotected`,
      description: depositsUnprotected > 0 ? "Immediate action required" : "All deposits protected",
    },
  ];

  return (
    <div
      className="grid w-full grid-cols-2 bg-[#1B2339] lg:grid-cols-4"
      style={{
        marginTop: "32px",
        borderTop: "2px solid #C4A35A",
        borderLeft: "1px solid #C4A35A",
        borderRight: "1px solid #C4A35A",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={card.status}
          className={`flex min-h-[190px] flex-col justify-center px-6 py-8 text-center ${
            index % 2 === 1 ? "border-l border-gold" : ""
          } ${index > 0 ? "lg:border-l lg:border-gold" : ""}`}
        >
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-dusty-cream/70">
            Tenancy
          </p>
          <p className="mt-4 font-display text-2xl leading-tight tracking-wide text-dusty-cream">
            {card.status}
          </p>
          <p className="mt-3 font-serif text-base tracking-wide text-dusty-cream">
            {card.value}
          </p>
          <p className="mt-2 text-xs italic leading-relaxed text-dusty-cream/65">
            {card.description}
          </p>
          {card.actionable ? (
            <button
              type="button"
              onClick={handleViewRenewals}
              className="mx-auto mt-3 min-h-8 text-[10px] font-normal uppercase tracking-[0.16em] text-gold transition hover:text-dusty-cream"
            >
              View tenancies →
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
