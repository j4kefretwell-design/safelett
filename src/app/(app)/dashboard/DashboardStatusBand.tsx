"use client";

export const DASHBOARD_HIGHLIGHT_AFFECTED_EVENT = "dashboard-highlight-affected";

interface DashboardStatusBandProps {
  isCompliant: boolean;
  needsAttention: number;
}

export default function DashboardStatusBand({
  isCompliant,
  needsAttention,
}: DashboardStatusBandProps) {
  function handleViewAffected() {
    document.getElementById("property-grid")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.dispatchEvent(new CustomEvent(DASHBOARD_HIGHLIGHT_AFFECTED_EVENT));
  }

  return (
    <section className="dashboard-status-band px-8 py-12 text-center sm:px-12 sm:py-14 lg:px-16">
      <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
        Portfolio Status —
      </p>
      <h1 className="mt-3 max-w-2xl font-serif text-xl font-normal leading-snug tracking-wide text-raspberry sm:mx-auto sm:text-2xl">
        {isCompliant
          ? "All Properties Compliant"
          : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
      </h1>
      {!isCompliant && (
        <button
          type="button"
          onClick={handleViewAffected}
          className="mt-4 text-sm italic text-gold transition hover:text-gold/75"
        >
          View affected properties ↓
        </button>
      )}
    </section>
  );
}
