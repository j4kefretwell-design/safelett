"use client";

import OptimizedFillImage from "@/components/OptimizedFillImage";
import { IMAGE_QUALITY, siteImages } from "@/lib/site-images";

interface TenancyStatusBandProps {
  activeCount: number;
  renewalsDue: number;
}

export default function TenancyStatusBand({
  activeCount,
  renewalsDue,
}: TenancyStatusBandProps) {
  function handleViewRenewals() {
    document.getElementById("tenancy-grid")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section
      className="relative h-[200px] w-full overflow-hidden sm:h-[280px] lg:h-[320px]"
      style={{ backgroundColor: siteImages.tenancyDashboardHero.placeholderColor }}
    >
      <OptimizedFillImage
        image={siteImages.tenancyDashboardHero}
        alt="Chandelier and staircase seen through a Georgian window"
        sizes="100vw"
        priority
        quality={IMAGE_QUALITY}
        className="object-cover"
        style={{ objectPosition: "center 50%" }}
      />
      <div className="absolute inset-0 bg-navy/45" aria-hidden="true" />

      <div className="absolute inset-x-4 bottom-4 z-10 max-w-md bg-navy px-6 py-5 sm:inset-x-auto sm:bottom-10 sm:left-10 sm:max-w-sm sm:px-8 sm:py-6">
        <div className="h-px w-10 bg-gold" aria-hidden="true" />
        <p className="mt-4 caps-label text-gold">Tenancy Portfolio</p>
        <h1 className="mt-4 font-serif text-[1.125rem] font-normal leading-snug tracking-wide text-dusty-cream">
          {renewalsDue > 0
            ? `${renewalsDue} ${renewalsDue === 1 ? "Renewal" : "Renewals"} Due`
            : `${activeCount} ${activeCount === 1 ? "Tenancy" : "Tenancies"} Active`}
        </h1>
        {renewalsDue > 0 ? (
          <button
            type="button"
            onClick={handleViewRenewals}
            className="mt-3 min-h-11 text-left text-[0.9375rem] italic leading-relaxed text-dusty-cream transition hover:text-white"
          >
            View tenancies <span className="text-gold not-italic">→</span>
          </button>
        ) : (
          <p className="mt-3 text-[0.9375rem] italic leading-relaxed text-dusty-cream/90">
            All tenancies in good standing.
          </p>
        )}
      </div>
    </section>
  );
}
