"use client";

import Image from "next/image";

interface DashboardHeroBannerProps {
  stats: {
    total: number;
    compliant: number;
    attention: number;
    overdue: number;
  };
}

export default function DashboardHeroBanner({ stats }: DashboardHeroBannerProps) {
  if (stats.total === 0) {
    return null;
  }

  const needsAttention = stats.attention + stats.overdue;
  const isCompliant = needsAttention === 0;

  return (
    <div className="relative -mx-6 mb-12 h-[220px] overflow-hidden sm:-mx-10 lg:-mx-14 sm:h-[240px]">
      <Image
        src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, calc(100vw - 18rem)"
        priority
      />
      <div className="absolute inset-0 bg-[#1A0A0C]/60" />

      <div className="relative z-10 flex h-full items-center px-8 sm:px-10 lg:px-14">
        <div>
          <p className="text-xs font-light uppercase tracking-[0.22em] text-dusty-cream/60">
            Portfolio Status
          </p>
          <h2 className="mt-3 font-serif text-2xl tracking-wide text-dusty-cream sm:text-3xl lg:text-4xl">
            {isCompliant
              ? "All Properties Compliant"
              : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
          </h2>
          <p className="mt-3 max-w-lg text-sm font-light text-dusty-cream/70">
            {isCompliant
              ? "Every certificate across your portfolio is current."
              : (
                <>
                  {stats.overdue > 0 && (
                    <span>
                      {stats.overdue} overdue
                      {stats.attention > 0 ? " · " : ""}
                    </span>
                  )}
                  {stats.attention > 0 && (
                    <span>{stats.attention} approaching expiry</span>
                  )}
                </>
              )}
          </p>
        </div>
      </div>
    </div>
  );
}
