import Link from "next/link";
import BackgroundImage from "@/components/BackgroundImage";
import { siteImages } from "@/lib/site-images";
import { btnGoldOutlineClassName, editorialBleedClassName } from "@/lib/ui";

export default function TenancyEmptyState() {
  return (
    <div className={`tenancy-slate-bg min-h-[calc(100vh-4rem)] ${editorialBleedClassName}`}>
      <section
        className="relative flex min-h-[min(58vh,520px)] w-full flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: siteImages.annieSprattTopiary.placeholderColor }}
      >
        <BackgroundImage
          image={siteImages.annieSprattTopiary}
          alt=""
          sizes="100vw"
          priority
          effect="fade"
        />
        <div className="absolute inset-0 bg-navy/60" aria-hidden="true" />

        <div className="relative z-10 px-6 py-16 text-center sm:py-20">
          <h1 className="max-w-xl font-serif text-3xl tracking-wide text-dusty-cream sm:text-4xl lg:text-5xl">
            Your tenancy portfolio awaits.
          </h1>
          <Link
            href="/tenancy/new"
            className={`${btnGoldOutlineClassName} mt-10 w-full sm:w-auto`}
          >
            Add Your First Tenancy
          </Link>
        </div>
      </section>
    </div>
  );
}
