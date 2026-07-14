"use client";

import OptimizedFillImage from "@/components/OptimizedFillImage";
import { siteImages } from "@/lib/site-images";
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
    <section
      className={`relative overflow-hidden bg-raspberry ${editorialBleedClassName}`}
      style={{ backgroundColor: siteImages.anthonyFomin.placeholderColor }}
    >
      <div className="absolute inset-0">
        <OptimizedFillImage
          image={siteImages.anthonyFomin}
          alt=""
          sizes="100vw"
          priority
          quality={60}
          className="object-cover opacity-[0.38]"
        />
      </div>
      <div className="absolute inset-0 bg-raspberry/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0C]/85 via-transparent to-raspberry/20" />

      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-24 text-center sm:px-12 sm:py-28 lg:px-16 lg:py-32">
        <p className="font-serif text-sm italic tracking-wide text-gold">
          Portfolio Status —
        </p>
        <h1 className="mt-5 max-w-4xl font-serif text-3xl italic leading-tight tracking-wide text-dusty-cream sm:text-4xl lg:text-5xl xl:text-6xl">
          {isCompliant
            ? "All Properties Compliant"
            : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
        </h1>
        {!isCompliant && (
          <p className="mt-6 max-w-lg text-sm font-light text-dusty-cream/70">
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
