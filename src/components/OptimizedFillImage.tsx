"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { IMAGE_QUALITY, type SiteImageAsset } from "@/lib/site-images";

interface OptimizedFillImageProps {
  image: SiteImageAsset;
  alt?: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
}

export default function OptimizedFillImage({
  image,
  alt = "",
  sizes,
  priority = false,
  quality = IMAGE_QUALITY,
  className = "object-cover",
  style,
  onLoad,
}: OptimizedFillImageProps) {
  const hasBlur =
    typeof image.blurDataURL === "string" &&
    image.blurDataURL.startsWith("data:image/");

  return (
    <Image
      src={image.src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      {...(priority ? {} : { loading: "lazy" as const })}
      placeholder={hasBlur ? "blur" : "empty"}
      {...(hasBlur ? { blurDataURL: image.blurDataURL } : {})}
      onLoad={onLoad}
      className={className}
      style={{
        backgroundColor: image.placeholderColor,
        ...style,
      }}
    />
  );
}
