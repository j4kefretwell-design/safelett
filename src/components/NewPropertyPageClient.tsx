"use client";

import BackgroundImage from "@/components/BackgroundImage";
import PropertyForm from "@/components/PropertyForm";
import { AnimateIn } from "@/components/AnimateIn";
import { editorialBleedClassName, editorialContentClassName } from "@/lib/ui";

export default function NewPropertyPageClient() {
  return (
    <AnimateIn>
      <div className={`grid min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-2 ${editorialBleedClassName}`}>
        <div className="relative hidden min-h-[480px] lg:block lg:min-h-full">
          <BackgroundImage
            src="/ben-elliott-unPC3it1yDA-unsplash.jpg"
            alt=""
            sizes="50vw"
            quality={70}
            placeholderColor="#39281D"
            effect="fade"
          />
          <div className="absolute inset-0 bg-espresso/50" />
          <div className="relative z-10 flex h-full items-end p-12 xl:p-16">
            <blockquote className="max-w-md">
              <p className="font-serif text-2xl leading-snug tracking-wide text-dusty-cream lg:text-3xl xl:text-4xl">
                &ldquo;Every great portfolio begins with a single property.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>

        <div className="flex flex-col bg-dusty-cream px-8 py-14 sm:px-12 lg:py-20 xl:px-16">
          <div className={editorialContentClassName}>
            <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
              Add a Property
            </p>
            <h1 className="mt-5 font-serif text-3xl tracking-wide text-text sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              Add a New Property to Your Portfolio.
            </h1>
            <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-leather">
              Enter the property details below. You can add compliance certificates
              once the property is saved.
            </p>
          </div>

          <div className={`${editorialContentClassName} mt-14 flex-1`}>
            <PropertyForm fullWidthSubmit />
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}
