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
    <div
      className="absolute bottom-8 left-4 z-10 max-w-md px-6 py-5 sm:bottom-12 sm:left-10 sm:px-7 sm:py-6"
      style={{ backgroundColor: "rgba(51,24,28,0.6)" }}
    >
      <p
        className="text-[9px] font-normal uppercase tracking-[0.32em]"
        style={{ color: "#C4A35A" }}
      >
        Compliance
      </p>
      <h1
        className="mt-3 font-serif text-xl font-normal leading-snug tracking-wide sm:text-2xl"
        style={{ color: "#F8F4EE" }}
      >
        {isCompliant
          ? "All Properties Compliant"
          : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need${needsAttention === 1 ? "s" : ""} Attention`}
      </h1>
      <p
        className="mt-2 text-xs italic leading-relaxed"
        style={{ color: "rgba(248,244,238,0.75)" }}
      >
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
  const cards = [
    { value: total, line: total === 1 ? "Property" : "Properties" },
    { value: compliant, line: "Compliant" },
    { value: attention, line: "Needs Attention" },
    { value: overdue, line: "Overdue" },
  ];

  return (
    <div
      className="grid w-full grid-cols-2 lg:grid-cols-4"
      style={{
        marginTop: "32px",
        marginBottom: "48px",
        backgroundColor: "#33181C",
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
            Compliance
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
