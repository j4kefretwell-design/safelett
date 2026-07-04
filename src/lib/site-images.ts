import type { StaticImageData } from "next/image";
import anthonyFominImg from "../../public/anthony-fomin-zjBxPUHE_ok-unsplash.jpg";
import benElliottHeroImg from "../../public/ben-elliott-8WJtlR3nlQY-unsplash.jpg";
import benElliottPropertyImg from "../../public/ben-elliott-unPC3it1yDA-unsplash.jpg";
import bradStarkeyImg from "../../public/brad-starkey-9QczXovmzCk-unsplash.jpg";
import hugoKruipImg from "../../public/hugo-kruip-i3Sx427bVXc-unsplash.jpg";
import rummanAminImg from "../../public/rumman-amin-CU0dmWuIz0c-unsplash.jpg";
import vojtechAuthImg from "../../public/vojtech-bartonicek-wgG7jLQ7M0U-unsplash-auth.jpg";
import vojtechImg from "../../public/vojtech-bartonicek-wgG7jLQ7M0U-unsplash.jpg";

export const IMAGE_QUALITY = 65;

export const DARK_IMAGE_PLACEHOLDER = "#1A0A0C";
export const LIGHT_IMAGE_PLACEHOLDER = "#F5F0E8";

export interface SiteImageAsset {
  src: StaticImageData;
  placeholderColor: string;
}

export const siteImages = {
  anthonyFomin: {
    src: anthonyFominImg,
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  benElliottHero: {
    src: benElliottHeroImg,
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  benElliottProperty: {
    src: benElliottPropertyImg,
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  bradStarkey: {
    src: bradStarkeyImg,
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  hugoKruip: {
    src: hugoKruipImg,
    placeholderColor: LIGHT_IMAGE_PLACEHOLDER,
  },
  rummanAmin: {
    src: rummanAminImg,
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  vojtech: {
    src: vojtechImg,
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
  vojtechAuth: {
    src: vojtechAuthImg,
    placeholderColor: DARK_IMAGE_PLACEHOLDER,
  },
} satisfies Record<string, SiteImageAsset>;
