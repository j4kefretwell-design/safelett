"use client";

import Link from "next/link";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { siteImages } from "@/lib/site-images";
import { btnOutlineClassName, editorialPagePaddingClassName } from "@/lib/ui";

export default function DashboardEmptyState() {
  return (
    <div className="dashboard-parchment-bg w-full min-w-0 overflow-x-hidden">
      <section
        className="relative h-[240px] w-full overflow-hidden sm:h-[320px] lg:h-[360px]"
        style={{ backgroundColor: siteImages.benElliottHero.placeholderColor }}
      >
        <OptimizedFillImage
          image={siteImages.benElliottHero}
          alt=""
          sizes="100vw"
          priority
          quality={60}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1A0A0C]/55" />
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center sm:px-8">
          <p className="text-on-image font-serif text-2xl tracking-wide text-dusty-cream sm:text-4xl lg:text-5xl">
            Your portfolio awaits.
          </p>
        </div>
      </section>

      <section className="dashboard-parchment-bg py-12 sm:py-20">
        <div
          className={`${editorialPagePaddingClassName} flex flex-col items-center text-center`}
        >
          <p className="text-base leading-relaxed text-leather">
            Add your first property to begin tracking compliance.
          </p>
          <Link
            href="/properties/new"
            className={`${btnOutlineClassName} mt-8 w-full sm:mt-10 sm:w-auto`}
          >
            Add Your First Property
          </Link>
        </div>
      </section>
    </div>
  );
}
