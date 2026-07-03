"use client";

import Image from "next/image";
import { useState } from "react";

interface BackgroundImageProps {
  src: string;
  alt?: string;
  sizes: string;
  /** LCP hero — eager load with high fetch priority */
  priority?: boolean;
  quality?: number;
  /** Solid colour shown instantly before the image loads */
  placeholderColor?: string;
  className?: string;
  imageClassName?: string;
}

export default function BackgroundImage({
  src,
  alt = "",
  sizes,
  priority = false,
  quality = 75,
  placeholderColor = "#33181C",
  className = "absolute inset-0",
  imageClassName = "object-cover",
}: BackgroundImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={className} aria-hidden={alt === "" ? true : undefined}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: placeholderColor }}
      />

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={`bg-image-blur ${imageClassName} ${
          loaded ? "bg-image-blur--loaded" : "bg-image-blur--loading"
        }`}
      />
    </div>
  );
}
