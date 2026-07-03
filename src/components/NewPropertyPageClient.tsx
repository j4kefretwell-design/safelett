"use client";

import BackgroundImage from "@/components/BackgroundImage";
import PropertyForm from "@/components/PropertyForm";
import { AnimateIn } from "@/components/AnimateIn";
import { ScrollRevealGroup } from "@/components/ScrollReveal";

export default function NewPropertyPageClient() {
  return (
    <AnimateIn>
      <div className="-mx-6 grid min-h-[640px] lg:mx-0 lg:grid-cols-2 lg:border lg:border-cocoa/15">
        <div className="relative hidden min-h-[480px] lg:block">
          <BackgroundImage
            src="/ben-elliott-unPC3it1yDA-unsplash.jpg"
            alt=""
            sizes="50vw"
            quality={70}
            placeholderColor="#33181C"
            effect="fade"
          />
          <div className="absolute inset-0 bg-[#1A0A0C]/55" />
          <div className="relative z-10 flex h-full items-end p-12">
            <blockquote>
              <p className="font-serif text-2xl leading-snug tracking-wide text-dusty-cream lg:text-3xl">
                &ldquo;Every great portfolio begins with a single property.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>

        <ScrollRevealGroup className="flex flex-col bg-dusty-cream px-8 py-12 sm:px-12 lg:py-16">
          <div>
            <p className="text-xs font-normal uppercase tracking-[0.22em] text-cocoa">
              Add Property
            </p>
            <h1 className="mt-4 font-serif text-3xl tracking-wide text-text sm:text-4xl">
              New Property
            </h1>
          </div>

          <div className="mt-12 flex-1">
            <PropertyForm fullWidthSubmit />
          </div>
        </ScrollRevealGroup>
      </div>
    </AnimateIn>
  );
}
