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
    <section className="relative h-[200px] w-full overflow-hidden bg-vanilla sm:h-[280px] lg:h-[320px]">
      <div className="absolute inset-x-4 bottom-4 z-10 max-w-md bg-raspberry px-6 py-5 sm:inset-x-auto sm:bottom-10 sm:left-10 sm:max-w-sm sm:px-8 sm:py-6">
        <div className="h-px w-10 bg-gold" aria-hidden="true" />
        <p className="mt-4 caps-label text-gold">
          Portfolio Status
        </p>
        <h1 className="mt-4 font-display text-[1.125rem] font-normal leading-snug tracking-wide text-dusty-cream">
          {isCompliant
            ? "All Properties Compliant"
            : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
        </h1>
        {!isCompliant ? (
          <button
            type="button"
            onClick={handleViewAffected}
            className="mt-3 min-h-11 text-left text-[0.9375rem] italic leading-relaxed text-dusty-cream transition hover:text-white"
          >
            View properties <span className="text-gold not-italic">→</span>
          </button>
        ) : (
          <p className="mt-3 text-[0.9375rem] italic leading-relaxed text-dusty-cream/90">
            All certificates current.
          </p>
        )}
      </div>
    </section>
  );
}
