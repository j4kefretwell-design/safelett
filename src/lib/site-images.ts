import { IMAGE_BLUR_DATA } from "@/lib/image-blur-data";

/** Large background / hero images */
export const BACKGROUND_IMAGE_QUALITY = 55;
/** Above-fold heroes — same as background */
export const IMAGE_QUALITY = 55;
/** Content / card / split-panel imagery */
export const CONTENT_IMAGE_QUALITY = 70;

export const LIGHT_IMAGE_PLACEHOLDER = "#F0ECE1";
export const STUDY_IMAGE_PLACEHOLDER = "#1C2B23";
export const NAVY_IMAGE_PLACEHOLDER = "#1B2A4A";
export const AUTH_IMAGE_PLACEHOLDER = "#2C1A10";

export interface SiteImageAsset {
  src: string;
  placeholderColor: string;
  blurDataURL: string;
}

function asset(
  src: string,
  placeholderColor: string,
  blurKey: keyof typeof IMAGE_BLUR_DATA
): SiteImageAsset {
  return {
    src,
    placeholderColor,
    blurDataURL: IMAGE_BLUR_DATA[blurKey],
  };
}

export const siteImages = {
  anthonyFomin: asset(
    "/anthony-fomin-zjBxPUHE_ok-unsplash.jpg",
    LIGHT_IMAGE_PLACEHOLDER,
    "anthonyFomin"
  ),
  benElliottHero: asset(
    "/ben-elliott-8WJtlR3nlQY-unsplash.jpg",
    STUDY_IMAGE_PLACEHOLDER,
    "benElliottHero"
  ),
  benElliottProperty: asset(
    "/ben-elliott-unPC3it1yDA-unsplash.jpg",
    STUDY_IMAGE_PLACEHOLDER,
    "benElliottProperty"
  ),
  bradStarkey: asset(
    "/brad-starkey-9QczXovmzCk-unsplash.jpg",
    LIGHT_IMAGE_PLACEHOLDER,
    "bradStarkey"
  ),
  georgeCiobra: asset(
    "/george-ciobra-LX1k7rOj7Sg-unsplash.jpg",
    STUDY_IMAGE_PLACEHOLDER,
    "georgeCiobra"
  ),
  jonnyGiosManor: asset(
    "/jonny-gios-g5ctwViRHy8-unsplash.jpg",
    NAVY_IMAGE_PLACEHOLDER,
    "jonnyGiosManor"
  ),
  eranjanCottage: asset(
    "/eranjan-Zh7nJn_Z4EE-unsplash.jpg",
    NAVY_IMAGE_PLACEHOLDER,
    "eranjanCottage"
  ),
  annieSprattManor: asset(
    "/annie-spratt-9wa278tcEsc-unsplash.jpg",
    NAVY_IMAGE_PLACEHOLDER,
    "annieSprattManor"
  ),
  sajeerMoCastle: asset(
    "/1784064261839_sajeer-mo-w3IfODdl6T8-unsplash.jpg",
    "#2C3A42",
    "sajeerMoCastle"
  ),
  annieSprattTopiary: asset(
    "/annie-spratt-4jT7kYTY5Ow-unsplash.jpg",
    NAVY_IMAGE_PLACEHOLDER,
    "annieSprattTopiary"
  ),
  hugoKruip: asset(
    "/hugo-kruip-i3Sx427bVXc-unsplash.jpg",
    "#3D2B1F",
    "hugoKruip"
  ),
  lukeGalloway: asset(
    "/luke-galloway-zv3D-Vq_SU0-unsplash.jpg",
    "#3D2B1F",
    "lukeGalloway"
  ),
  rummanAmin: asset(
    "/rumman-amin-CU0dmWuIz0c-unsplash.jpg",
    STUDY_IMAGE_PLACEHOLDER,
    "rummanAmin"
  ),
  vojtech: asset(
    "/vojtech-bartonicek-wgG7jLQ7M0U-unsplash.jpg",
    LIGHT_IMAGE_PLACEHOLDER,
    "vojtech"
  ),
  vojtechAuth: asset(
    "/vojtech-bartonicek-wgG7jLQ7M0U-unsplash-auth.jpg",
    AUTH_IMAGE_PLACEHOLDER,
    "vojtechAuth"
  ),
} satisfies Record<string, SiteImageAsset>;
