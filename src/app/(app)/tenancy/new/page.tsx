"use client";

import BackgroundImage from "@/components/BackgroundImage";
import PageBackLink from "@/components/PageBackLink";
import TenancyForm from "@/components/tenancy/TenancyForm";
import { AnimateIn } from "@/components/AnimateIn";
import { siteImages } from "@/lib/site-images";

export default function NewTenancyPage() {
  return (
    <AnimateIn>
      <div className="grid w-full lg:grid-cols-[2fr_3fr]">
        <div
          className="relative hidden lg:sticky lg:top-0 lg:block lg:h-[calc(100vh-4rem)] lg:self-start"
          style={{ backgroundColor: siteImages.annieSprattManor.placeholderColor }}
        >
          <BackgroundImage
            image={siteImages.annieSprattManor}
            alt=""
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            effect="fade"
          />
          <div className="absolute inset-0 bg-navy/70" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 xl:p-16">
            <blockquote className="max-w-sm">
              <p className="font-serif text-2xl leading-snug tracking-wide text-dusty-cream lg:text-3xl">
                &ldquo;Every tenancy managed with the same care as every
                certificate.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>

        <div className="flex w-full flex-col bg-white px-8 py-14 sm:px-12 lg:px-16 lg:py-20 xl:px-20">
          <PageBackLink href="/tenancy/dashboard">← Back to Tenancy</PageBackLink>
          <p className="mt-8 text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
            Add a Tenancy
          </p>
          <h1 className="mt-5 max-w-xl font-serif text-3xl tracking-wide text-tenancy-text sm:text-4xl">
            Record a New Tenancy
          </h1>
          <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-steel">
            Enter tenancy details, key dates, and upload supporting documents.
            Fretwell &amp; Co will track renewals and compliance deadlines for you.
          </p>

          <div className="mt-14 flex-1">
            <TenancyForm />
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}
