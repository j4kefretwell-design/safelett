"use client";

import Image from "next/image";

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
    <section className="relative h-[320px] w-full overflow-hidden">
      <Image
        src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-[#1A0A0C]/45" aria-hidden="true" />

      <div className="absolute bottom-10 left-10 z-10 max-w-sm bg-raspberry px-8 py-6">
        <div className="h-px w-10 bg-gold" aria-hidden="true" />
        <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.38em] text-gold">
          Portfolio Status
        </p>
        <h1 className="mt-4 font-serif text-[1.4rem] font-normal leading-snug tracking-wide text-dusty-cream">
          {isCompliant
            ? "All Properties Compliant"
            : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
        </h1>
        {!isCompliant ? (
          <button
            type="button"
            onClick={handleViewAffected}
            className="mt-3 text-xs italic text-dusty-cream/90 transition hover:text-dusty-cream"
          >
            View properties <span className="text-gold not-italic">→</span>
          </button>
        ) : (
          <p className="mt-3 text-xs italic text-dusty-cream/90">
            All certificates current.
          </p>
        )}
      </div>
    </section>
  );
}
