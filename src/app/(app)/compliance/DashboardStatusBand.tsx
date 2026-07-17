"use client";

import { editorialPagePaddingClassName } from "@/lib/ui";

export const DASHBOARD_HIGHLIGHT_AFFECTED_EVENT = "dashboard-highlight-affected";

interface DashboardStatusBandProps {
  total: number;
  compliant: number;
  attention: number;
  overdue: number;
}

export default function DashboardStatusBand({
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
      statusClass: "text-heading",
    },
    {
      status: compliant === total ? "All Compliant" : "Compliant",
      value: `${compliant} current`,
      description: "Certificates up to date",
      statusClass: "text-compliant",
    },
    {
      status: "Needs Attention",
      value: `${attention} approaching expiry`,
      description: "Review upcoming deadlines",
      statusClass: "text-attention",
      actionable: attention > 0,
    },
    {
      status: "Overdue",
      value: `${overdue} past due`,
      description: "Immediate action required",
      statusClass: "text-urgent",
      actionable: overdue > 0,
    },
  ];

  return (
    <div className={`relative z-10 flex h-full items-center py-6 sm:py-10 ${editorialPagePaddingClassName}`}>
        <div className="grid h-full w-full grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.status}
              className="flex min-h-0 flex-col bg-vanilla p-6 text-center shadow-[inset_0_0_0_1px_rgba(196,164,90,0.3)] sm:p-10"
            >
              <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-raspberry">
                Compliance
              </p>
              <div className="mx-auto mt-5 h-px w-10 bg-gold/70" aria-hidden="true" />
              <p className={`mt-auto font-display text-[clamp(1.3rem,2.5vw,1.8rem)] leading-tight tracking-wide ${card.statusClass}`}>
                {card.status}
              </p>
              <p className="mt-5 font-serif text-lg tracking-wide text-heading sm:text-xl">
                {card.value}
              </p>
              <p className="mt-2 text-xs italic leading-relaxed text-leather sm:text-sm">
                {card.description}
              </p>
              {card.actionable ? (
                <button
                  type="button"
                  onClick={handleViewAffected}
                  className="mt-auto min-h-11 pt-4 text-[10px] font-normal uppercase tracking-[0.18em] text-gold-readable transition hover:text-gold"
                >
                  View properties →
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
