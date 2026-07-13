export const IMAGE_QUALITY = 65;

export const LIGHT_IMAGE_PLACEHOLDER = "#F2EDE8";
export const NAVY_IMAGE_PLACEHOLDER = "#1B2A4A";
export const AUTH_IMAGE_PLACEHOLDER = "#2C1A10";

export interface SiteImageAsset {
  src: string;
  placeholderColor: string;
}

export const siteImages = {
  anthonyFomin: {
    src: "/anthony-fomin-zjBxPUHE_ok-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  benElliottHero: {
    src: "/ben-elliott-8WJtlR3nlQY-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  benElliottProperty: {
    src: "/ben-elliott-unPC3it1yDA-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  bradStarkey: {
    src: "/brad-starkey-9QczXovmzCk-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  georgeCiobra: {
    src: "/george-ciobra-LX1k7rOj7Sg-unsplash.jpg",
    placeholderColor: NAVY_IMAGE_PLACEHOLDER,
  },
  jonnyGiosManor: {
    src: "/jonny-gios-g5ctwViRHy8-unsplash.jpg",
    placeholderColor: NAVY_IMAGE_PLACEHOLDER,
  },
  eranjanCottage: {
    src: "/eranjan-Zh7nJn_Z4EE-unsplash.jpg",
    placeholderColor: NAVY_IMAGE_PLACEHOLDER,
  },
  annieSprattManor: {
    src: "/annie-spratt-9wa278tcEsc-unsplash.jpg",
    placeholderColor: NAVY_IMAGE_PLACEHOLDER,
  },
  annieSprattTopiary: {
    src: "/annie-spratt-4jT7kYTY5Ow-unsplash.jpg",
    placeholderColor: NAVY_IMAGE_PLACEHOLDER,
  },
  hugoKruip: {
    src: "/hugo-kruip-i3Sx427bVXc-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  rummanAmin: {
    src: "/rumman-amin-CU0dmWuIz0c-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  vojtech: {
    src: "/vojtech-bartonicek-wgG7jLQ7M0U-unsplash.jpg",
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  vojtechAuth: {
    src: "/vojtech-bartonicek-wgG7jLQ7M0U-unsplash-auth.jpg",
    placeholderColor: AUTH_IMAGE_PLACEHOLDER,
  },
} satisfies Record<string, SiteImageAsset>;
