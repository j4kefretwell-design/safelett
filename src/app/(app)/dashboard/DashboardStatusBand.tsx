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

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="text-[10px] font-normal uppercase tracking-[0.38em] text-gold">
          Portfolio Status —
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-[2.5rem] font-normal leading-tight tracking-wide text-dusty-cream">
          {isCompliant
            ? "All Properties Compliant"
            : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
        </h1>
        {!isCompliant ? (
          <button
            type="button"
            onClick={handleViewAffected}
            className="mt-4 text-sm italic text-gold transition hover:text-gold/75"
          >
            View affected properties ↓
          </button>
        ) : (
          <p className="mt-4 text-sm italic text-dusty-cream/85">
            Every certificate current and protected.
          </p>
        )}
      </div>
    </section>
  );
}
