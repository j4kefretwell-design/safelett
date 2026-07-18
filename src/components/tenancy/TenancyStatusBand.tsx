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
      className="absolute bottom-8 left-4 z-10 max-w-md px-6 py-5 sm:bottom-12 sm:left-10 sm:px-7 sm:py-6"
      style={{ backgroundColor: "rgba(27,35,57,0.6)" }}
    >
      <p
        className="text-[9px] font-normal uppercase tracking-[0.32em]"
        style={{ color: "#C4A35A" }}
      >
        Tenancy
      </p>
      <h1
        className="mt-3 font-serif text-xl font-normal leading-snug tracking-wide sm:text-2xl"
        style={{ color: "#F8F4EE" }}
      >
        {renewalsDue > 0
          ? `${renewalsDue} ${renewalsDue === 1 ? "Renewal" : "Renewals"} Due`
          : "All Tenancies in Good Standing"}
      </h1>
      <p
        className="mt-2 text-xs italic leading-relaxed"
        style={{ color: "rgba(248,244,238,0.75)" }}
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
  const cards = [
    { value: total, line: total === 1 ? "Tenancy" : "Tenancies" },
    { value: renewalsDue, line: "Renewals Due" },
    { value: rentReviewsDue, line: "Rent Reviews Due" },
    { value: depositsUnprotected, line: "Deposits Unprotected" },
  ];

  return (
    <div
      className="grid w-full grid-cols-2 lg:grid-cols-4"
      style={{
        marginTop: "32px",
        marginBottom: "48px",
        backgroundColor: "#1B2339",
        borderTop: "1px solid #C4A35A",
        borderLeft: "1px solid #C4A35A",
        borderRight: "1px solid #C4A35A",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={card.line}
          className="flex flex-col items-center justify-center px-6 py-12 text-center sm:py-14"
          style={
            index > 0
              ? { borderLeft: "1px solid rgba(196,163,90,0.55)" }
              : undefined
          }
        >
          <p
            className="text-[9px] font-normal uppercase tracking-[0.32em]"
            style={{ color: "#C4A35A" }}
          >
            Tenancy
          </p>
          <p
            className="mt-5 font-display text-5xl font-normal tracking-wide sm:text-6xl"
            style={{ color: "#F8F4EE" }}
          >
            {card.value}
          </p>
          <p
            className="mt-4 text-[11px] font-normal uppercase tracking-[0.18em]"
            style={{ color: "rgba(248,244,238,0.75)" }}
          >
            {card.line}
          </p>
        </div>
      ))}
    </div>
  );
}
