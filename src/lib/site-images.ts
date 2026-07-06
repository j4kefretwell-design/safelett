export const IMAGE_QUALITY = 65;

export const DARK_IMAGE_PLACEHOLDER = "#1A0A0C";
export const LIGHT_IMAGE_PLACEHOLDER = "#F5F0E8";

export interface SiteImageAsset {
  src: string;
  placeholderColor: string;
}

export const siteImages = {
  anthonyFomin: {
    src: "/anthony-fomin-zjBxPUHE_ok-unsplash.jpg",
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  benElliottHero: {
    src: "/ben-elliott-8WJtlR3nlQY-unsplash.jpg",
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  benElliottProperty: {
    src: "/ben-elliott-unPC3it1yDA-unsplash.jpg",
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  bradStarkey: {
    src: "/brad-starkey-9QczXovmzCk-unsplash.jpg",
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  hugoKruip: {
    src: "/hugo-kruip-i3Sx427bVXc-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  rummanAmin: {
    src: "/rumman-amin-CU0dmWuIz0c-unsplash.jpg",
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  vojtech: {
    src: "/vojtech-bartonicek-wgG7jLQ7M0U-unsplash.jpg",
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  vojtechAuth: {
    src: "/vojtech-bartonicek-wgG7jLQ7M0U-unsplash-auth.jpg",
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
} satisfies Record<string, SiteImageAsset>;
