"use client";

import OptimizedFillImage from "@/components/OptimizedFillImage";
import { CONTENT_IMAGE_QUALITY, siteImages } from "@/lib/site-images";

export default function DashboardCottageImage() {
  return (
    <div
      className="relative h-[220px] overflow-hidden sm:h-[280px]"
      style={{ backgroundColor: siteImages.benElliottHero.placeholderColor }}
    >
      <OptimizedFillImage
        image={siteImages.benElliottHero}
        alt=""
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={CONTENT_IMAGE_QUALITY}
        className="object-cover"
        style={{ objectPosition: "38% center" }}
      />
    </div>
  );
}
