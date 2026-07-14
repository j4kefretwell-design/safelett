"use client";

import OptimizedFillImage from "@/components/OptimizedFillImage";
import { siteImages } from "@/lib/site-images";

export default function DashboardCottageImage() {
  return (
    <div
      className="relative h-[220px] overflow-hidden sm:h-[280px]"
      style={{ backgroundColor: siteImages.benElliottHero.placeholderColor }}
    >
      <OptimizedFillImage
        image={siteImages.benElliottHero}
        alt=""
        sizes="(max-width: 1024px) 100vw, 45vw"
        quality={60}
        className="object-cover"
        style={{ objectPosition: "38% center" }}
      />
    </div>
  );
}
