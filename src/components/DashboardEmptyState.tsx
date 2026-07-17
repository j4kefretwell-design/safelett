import Link from "next/link";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import { editorialPagePaddingClassName } from "@/lib/ui";

const ONBOARDING_STEPS = [
  { step: "01", title: "Add a Property", description: "Register your first address" },
  { step: "02", title: "Track Certificates", description: "Log compliance deadlines" },
  { step: "03", title: "Stay Compliant", description: "Receive alerts before expiry" },
] as const;

export default function DashboardEmptyState() {
  return (
    <div className="dashboard-parchment-bg w-full min-w-0 overflow-x-hidden">
      <section
        className="relative h-[200px] w-full overflow-hidden sm:h-[280px] lg:h-[320px]"
        style={{ backgroundColor: siteImages.eranjanCottage.placeholderColor }}
      >
        <OptimizedFillImage
          image={siteImages.eranjanCottage}
          alt=""
          sizes="100vw"
          priority
          quality={IMAGE_QUALITY}
          className="object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-[#252525]/45" aria-hidden="true" />

        <div className="absolute inset-x-4 bottom-4 z-10 max-w-md bg-raspberry px-6 py-5 sm:inset-x-auto sm:bottom-10 sm:left-10 sm:max-w-sm sm:px-8 sm:py-6">
          <div className="h-px w-10 bg-gold" aria-hidden="true" />
          <p className="mt-4 caps-label text-gold">Portfolio Status</p>
          <h1 className="mt-4 font-serif text-[1.125rem] font-normal leading-snug tracking-wide text-dusty-cream sm:text-xl">
            Start Your Portfolio
          </h1>
          <Link
            href="/properties/new"
            className="mt-3 inline-block min-h-11 text-[0.9375rem] text-gold transition hover:text-gold-readable"
          >
            Add Your First Property →
          </Link>
        </div>
      </section>

      <section className="bg-dusty-cream py-12 sm:py-16">
        <div
          className={`${editorialPagePaddingClassName} flex flex-col items-center text-center`}
        >
          <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-raspberry">
            Start Your Portfolio
          </p>
          <div className="mt-3 h-px w-10 bg-gold" aria-hidden="true" />

          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {ONBOARDING_STEPS.map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <p className="font-serif text-2xl tracking-wide text-gold">
                  {item.step}
                </p>
                <p className="mt-3 font-serif text-lg tracking-wide text-text">
                  {item.title}
                </p>
                <p className="mt-2 text-sm font-light italic text-leather">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/properties/new"
            className="mt-12 inline-flex min-h-12 items-center justify-center border border-raspberry px-8 text-[11px] font-normal uppercase tracking-[0.14em] text-raspberry transition hover:bg-raspberry hover:text-dusty-cream"
          >
            Add Your First Property +
          </Link>
        </div>
      </section>
    </div>
  );
}
