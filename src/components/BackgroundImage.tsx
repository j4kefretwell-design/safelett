"use client";

import { useState } from "react";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import {
  BACKGROUND_IMAGE_QUALITY,
  type SiteImageAsset,
} from "@/lib/site-images";

interface BackgroundImageProps {
  image: SiteImageAsset;
  alt?: string;
  sizes: string;
  /** LCP hero — eager load with high fetch priority */
  priority?: boolean;
  quality?: number;
  /** blur = landing editorial; fade = auth backgrounds */
  effect?: "blur" | "fade";
  className?: string;
  imageClassName?: string;
}

export default function BackgroundImage({
  image,
  alt = "",
  sizes,
  priority = false,
  quality = BACKGROUND_IMAGE_QUALITY,
  effect = "blur",
  className = "absolute inset-0",
  imageClassName = "object-cover",
}: BackgroundImageProps) {
  const [loaded, setLoaded] = useState(false);

  const effectClass =
    effect === "fade" ? "bg-image-fade" : "bg-image-blur";
  const loadingClass =
    effect === "fade" ? "bg-image-fade--loading" : "bg-image-blur--loading";
  const loadedClass =
    effect === "fade" ? "bg-image-fade--loaded" : "bg-image-blur--loaded";

  return (
    <div className={className} aria-hidden={alt === "" ? true : undefined}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: image.placeholderColor }}
      />

      <OptimizedFillImage
        image={image}
        alt={alt}
        sizes={sizes}
        priority={priority}
        quality={quality}
        onLoad={() => setLoaded(true)}
        className={`${effectClass} ${imageClassName} ${
          loaded ? loadedClass : loadingClass
        }`}
      />
    </div>
  );
}
