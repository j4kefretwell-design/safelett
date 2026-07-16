import Link from "next/link";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import { btnNavyOutlineClassName, editorialPagePaddingClassName } from "@/lib/ui";

const ONBOARDING_STEPS = [
  { step: "01", title: "Add a Tenancy", description: "Register your first let" },
  { step: "02", title: "Track Key Dates", description: "Renewals, reviews and deposits" },
  { step: "03", title: "Generate Notices", description: "Professional correspondence" },
] as const;

export default function TenancyEmptyState() {
  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden">
      <section
        className="relative h-[200px] w-full overflow-hidden sm:h-[280px] lg:h-[320px]"
        style={{ backgroundColor: siteImages.jonnyGiosManor.placeholderColor }}
      >
        <OptimizedFillImage
          image={siteImages.jonnyGiosManor}
          alt="Georgian manor house viewed through autumn leaves"
          sizes="100vw"
          priority
          quality={IMAGE_QUALITY}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-navy/50" aria-hidden="true" />

        <div className="absolute inset-x-4 bottom-4 z-10 max-w-md bg-navy px-6 py-5 sm:inset-x-auto sm:bottom-10 sm:left-10 sm:max-w-sm sm:px-8 sm:py-6">
          <div className="h-px w-10 bg-gold" aria-hidden="true" />
          <p className="mt-4 caps-label text-gold">Your Tenancy Portfolio</p>
          <h1 className="mt-4 font-serif text-[1.125rem] font-normal leading-snug tracking-wide text-dusty-cream sm:text-xl">
            Add your first tenancy to begin tracking.
          </h1>
        </div>
      </section>

      <section className="bg-dusty-cream py-12 sm:py-16">
        <div
          className={`${editorialPagePaddingClassName} flex flex-col items-center text-center`}
        >
          <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-navy">
            Start Your Portfolio
          </p>
          <div className="mt-3 h-px w-10 bg-gold" aria-hidden="true" />

          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {ONBOARDING_STEPS.map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <p className="font-serif text-2xl tracking-wide text-gold">
                  {item.step}
                </p>
                <p className="mt-3 font-serif text-lg tracking-wide text-tenancy-text">
                  {item.title}
                </p>
                <p className="mt-2 text-sm font-light italic text-steel">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/tenancy/new"
            className={`${btnNavyOutlineClassName} mt-12 px-10`}
          >
            Add Your First Tenancy +
          </Link>
        </div>
      </section>
    </div>
  );
}
