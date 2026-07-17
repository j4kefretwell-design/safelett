"use client";

export const DASHBOARD_HIGHLIGHT_AFFECTED_EVENT = "dashboard-highlight-affected";

interface DashboardStatusBandProps {
  total: number;
  compliant: number;
  attention: number;
  overdue: number;
}

export default function DashboardStatusBand({
  compliant,
  attention,
  overdue,
}: DashboardStatusBandProps) {
  const needsAttention = attention + overdue;
  const isCompliant = needsAttention === 0;

  return (
    <div className="absolute inset-x-4 bottom-4 z-10 max-w-md bg-[#33181C] px-6 py-5 sm:inset-x-auto sm:bottom-10 sm:left-10 sm:max-w-sm sm:px-8 sm:py-6">
      <div className="h-px w-10 bg-gold" aria-hidden="true" />
      <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.28em] text-gold">
        Compliance Portfolio
      </p>
      <h1 className="mt-4 font-display text-2xl font-normal leading-snug tracking-wide text-dusty-cream sm:text-3xl">
        {isCompliant
          ? "All Properties Compliant"
          : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
      </h1>
      <p className="mt-3 text-sm italic leading-relaxed text-dusty-cream/80">
        {isCompliant
          ? `${compliant} current and protected`
          : "Review the affected properties below."}
      </p>
    </div>
  );
}

export function DashboardStatsRow({
  total,
  compliant,
  attention,
  overdue,
}: DashboardStatusBandProps) {
  function handleViewAffected() {
    document.getElementById("property-grid")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.dispatchEvent(new CustomEvent(DASHBOARD_HIGHLIGHT_AFFECTED_EVENT));
  }

  const cards = [
    {
      status: "Portfolio Overview",
      value: `${total} ${total === 1 ? "property" : "properties"}`,
      description: "Across your portfolio",
    },
    {
      status: compliant === total ? "All Compliant" : "Compliant",
      value: `${compliant} current`,
      description: "Certificates up to date",
    },
    {
      status: "Needs Attention",
      value: `${attention} approaching expiry`,
      description: "Review upcoming deadlines",
      actionable: attention > 0,
    },
    {
      status: "Overdue",
      value: `${overdue} past due`,
      description: "Immediate action required",
      actionable: overdue > 0,
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 bg-[#33181C] lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.status}
          className={`flex min-h-[190px] flex-col justify-center px-6 py-8 text-center ${
            index % 2 === 1 ? "border-l border-gold" : ""
          } ${index > 0 ? "lg:border-l lg:border-gold" : ""}`}
        >
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-dusty-cream/70">
            Compliance
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
              onClick={handleViewAffected}
              className="mx-auto mt-3 min-h-8 text-[10px] font-normal uppercase tracking-[0.16em] text-gold transition hover:text-dusty-cream"
            >
              View properties →
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
