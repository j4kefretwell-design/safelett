"use client";

import Image from "next/image";
import { editorialBleedClassName } from "@/lib/ui";

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
    <section className={`relative overflow-hidden bg-raspberry ${editorialBleedClassName}`}>
      <div className="absolute inset-0">
        <Image
          src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.18]"
          sizes="100vw"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-raspberry/75" />

      <div className="relative z-10 px-8 py-20 sm:px-12 sm:py-24 lg:px-16 lg:py-28">
        <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-dusty-cream/50">
          Portfolio Status
        </p>
        <h1 className="mt-6 max-w-3xl font-serif text-3xl italic leading-tight tracking-wide text-dusty-cream sm:text-4xl lg:text-5xl">
          {isCompliant
            ? "All Properties Compliant"
            : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
        </h1>
        {!isCompliant && (
          <p className="mt-5 max-w-lg text-sm font-light text-dusty-cream/60">
            {stats.overdue > 0 && (
              <span>
                {stats.overdue} overdue
                {stats.attention > 0 ? " · " : ""}
              </span>
            )}
            {stats.attention > 0 && (
              <span>{stats.attention} approaching expiry</span>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
