"use client";

import Image from "next/image";
import { IMAGE_QUALITY, type SiteImageAsset } from "@/lib/site-images";

interface OptimizedFillImageProps {
  image: SiteImageAsset;
  alt?: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  onLoad?: () => void;
}

export default function OptimizedFillImage({
  image,
  alt = "",
  sizes,
  priority = false,
  quality = IMAGE_QUALITY,
  className = "object-cover",
  onLoad,
}: OptimizedFillImageProps) {
  return (
    <Image
      src={image.src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      placeholder="blur"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onLoad={onLoad}
      className={className}
    />
  );
}
