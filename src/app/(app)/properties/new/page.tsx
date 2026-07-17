"use client";

import BackgroundImage from "@/components/BackgroundImage";
import PageBackLink from "@/components/PageBackLink";
import PropertyForm from "@/components/PropertyForm";
import { AnimateIn } from "@/components/AnimateIn";
import { siteImages } from "@/lib/site-images";

export default function NewPropertyPage() {
  return (
    <AnimateIn>
      <div className="grid min-h-[calc(100vh-4rem)] w-full lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[2fr_3fr]">
        <div
          className="relative hidden min-h-[480px] lg:block lg:min-h-full"
          style={{ backgroundColor: siteImages.benElliottProperty.placeholderColor }}
        >
          <BackgroundImage
            image={siteImages.benElliottProperty}
            alt=""
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            effect="fade"
          />
          <div className="absolute inset-0 bg-espresso/65" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 xl:p-16">
            <blockquote className="max-w-sm">
              <p className="font-serif text-2xl leading-snug tracking-wide text-dusty-cream lg:text-3xl">
                &ldquo;Every great portfolio begins with a single property.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>

        <div className="flex w-full flex-col bg-vanilla px-8 py-14 sm:px-12 lg:px-16 lg:py-20 xl:px-20">
          <PageBackLink href="/compliance">← Back to Dashboard</PageBackLink>
          <p className="mt-8 text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
            Add a Property
          </p>
          <h1 className="mt-5 max-w-xl font-serif text-3xl tracking-wide text-heading sm:text-4xl lg:leading-tight">
            Add a New Property to Your Portfolio.
          </h1>
          <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-leather">
            Enter the property details below. You can add compliance certificates
            once the property is saved.
          </p>

          <p className="mt-12 text-[10px] font-normal uppercase tracking-[0.24em] text-leather">
            Step 1 of 1 — Property Details
          </p>

          <div className="mt-14 flex-1">
            <PropertyForm fullWidthSubmit hideSectionHeader />
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}
