"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import ScrollReveal, { ScrollRevealGroup } from "@/components/ScrollReveal";

const pricingFeatures = [
  "Unlimited properties",
  "All 13 certificate types",
  "Automated expiry alerts",
  "Secure document storage",
  "Contractor contacts",
  "CSV export & bulk import",
  "Landlord sharing portal",
];

const features = [
  {
    number: "01",
    title: "Certificate Tracking",
    body: "Gas Safety, EICR, EPC, and every compliance document — organised by property, always current and audit-ready.",
  },
  {
    number: "02",
    title: "Automated Alerts",
    body: "Gentle reminders at 60, 30, and 7 days before expiry, with contractor details included so you can act immediately.",
  },
  {
    number: "03",
    title: "Document Storage",
    body: "Secure storage for every certificate and compliance record, accessible whenever your portfolio demands it.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-dusty-cream text-text">
      {/* Fixed navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gold bg-raspberry">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-6 sm:px-10">
          <div />
          <div className="flex justify-center">
            <BrandWordmark href="/" variant="nav" />
          </div>
          <div className="text-right">
            <Link
              href="/login"
              className="text-xs font-light tracking-[0.12em] text-dusty-cream/75 transition hover:text-dusty-cream"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col pt-16">
        <BackgroundImage
          src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
          alt="Elegant property exterior"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#1A0A0C]/55" />

        <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-20 pt-12 sm:px-12 sm:pb-28 lg:px-16">
          <ScrollRevealGroup className="mx-auto w-full max-w-4xl space-y-6" staggerMs={100}>
            <p className="text-xs font-light uppercase tracking-[0.28em] text-dusty-cream/80">
              Property Compliance Specialists
            </p>
            <h1 className="max-w-3xl font-serif text-5xl leading-[1.08] tracking-[0.02em] text-dusty-cream sm:text-6xl lg:text-7xl">
              Protecting What Matters Most.
            </h1>
            <div className="h-px w-20 bg-gold" aria-hidden="true" />
            <p className="max-w-lg text-sm font-light leading-relaxed text-dusty-cream/75 sm:text-base">
              Automated compliance tracking for property management
              professionals across the United Kingdom.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-dusty-cream px-8 py-3.5 text-xs font-normal uppercase tracking-[0.14em] text-text transition hover:bg-dusty-cream/90"
              >
                Begin Your Trial
              </Link>
              <a
                href="#why"
                className="inline-flex items-center justify-center border border-dusty-cream/50 px-8 py-3.5 text-xs font-light uppercase tracking-[0.14em] text-dusty-cream transition hover:border-dusty-cream hover:bg-dusty-cream/5"
              >
                Learn More
              </a>
            </div>
          </ScrollRevealGroup>
        </div>
      </section>

      <div className="h-px w-full bg-gold" aria-hidden="true" />

      {/* Editorial split */}
      <ScrollReveal>
        <section id="why" className="grid min-h-[560px] lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-full">
            <BackgroundImage
              src="/brad-starkey-9QczXovmzCk-unsplash.jpg"
              alt="Refined interior"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-[#1A0A0C]/25" />
          </div>

          <div className="flex flex-col justify-center bg-dusty-cream px-8 py-20 sm:px-14 lg:px-16 lg:py-28">
            <ScrollRevealGroup className="max-w-md space-y-6" staggerMs={100}>
              <p className="text-xs font-light uppercase tracking-[0.24em] text-cocoa">
                Why Fretwell &amp; Co
              </p>
              <h2 className="font-serif text-3xl leading-snug tracking-[0.02em] text-text sm:text-4xl lg:text-[2.75rem]">
                The Standard of Care Your Portfolio Deserves.
              </h2>
              <p className="text-sm font-light leading-relaxed text-cocoa sm:text-base">
                Property compliance is fragmented, time-consuming, and
                unforgiving. Missed renewals carry real consequences — for your
                tenants, your reputation, and your business.
              </p>
              <p className="text-sm font-light leading-relaxed text-cocoa/80 sm:text-base">
                Fretwell &amp; Co brings every certificate, every deadline, and
                every document into one considered system — so you lead with
                confidence, not anxiety.
              </p>
              <a
                href="#features"
                className="inline-flex w-fit border border-cocoa/40 px-7 py-3 text-xs font-light uppercase tracking-[0.12em] text-text transition hover:border-cocoa hover:bg-beige/40"
              >
                Discover More →
              </a>
            </ScrollRevealGroup>
          </div>
        </section>
      </ScrollReveal>

      {/* Three features — cinematic dark */}
      <ScrollReveal>
        <section
          id="features"
          className="bg-raspberry px-6 py-24 sm:px-10 sm:py-32 lg:py-40"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-3 lg:gap-0">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.number} delay={index * 100}>
                <div
                  className={`px-6 py-4 lg:px-10 lg:py-6 ${
                    index < features.length - 1
                      ? "lg:border-r lg:border-gold/25"
                      : ""
                  }`}
                >
                  <p className="text-sm font-light tracking-[0.2em] text-gold">
                    {feature.number}
                  </p>
                  <div className="mt-6 h-px w-12 bg-gold/60" />
                  <h3 className="mt-8 font-serif text-2xl tracking-[0.02em] text-dusty-cream sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-5 text-sm font-light leading-relaxed text-dusty-cream/65 sm:text-base">
                    {feature.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Split quote + image */}
      <ScrollReveal>
        <section className="grid min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-beige px-8 py-20 sm:px-14 lg:px-16 lg:py-28">
            <ScrollRevealGroup className="max-w-lg space-y-8" staggerMs={100}>
              <blockquote>
                <p className="font-serif text-3xl italic leading-snug tracking-[0.01em] text-text sm:text-4xl lg:text-[2.5rem] lg:leading-snug">
                  &ldquo;Every deadline met. Every certificate tracked. Every
                  property protected.&rdquo;
                </p>
              </blockquote>
              <Link
                href="/signup"
                className="inline-block text-sm font-light tracking-[0.08em] text-cocoa underline-offset-4 transition hover:text-text hover:underline"
              >
                Start Free Trial →
              </Link>
            </ScrollRevealGroup>
          </div>

          <div className="relative min-h-[320px] lg:min-h-full">
            <BackgroundImage
              src="/hugo-kruip-i3Sx427bVXc-unsplash.jpg"
              alt="Architectural detail"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </section>
      </ScrollReveal>

      {/* Pricing */}
      <ScrollReveal>
        <section className="bg-dusty-cream px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-lg text-center">
            <ScrollRevealGroup className="space-y-6" staggerMs={100}>
              <p className="text-xs font-light uppercase tracking-[0.24em] text-cocoa">
                Simple Pricing
              </p>
              <h2 className="font-serif text-3xl tracking-[0.02em] text-text sm:text-4xl">
                One Plan. Everything Included.
              </h2>

              <div className="mx-auto mt-10 max-w-sm border border-cocoa/20 bg-beige px-8 py-10 text-left sm:px-10 sm:py-12">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-6xl tracking-wide text-text">
                    £49
                  </span>
                  <span className="text-sm font-light text-cocoa">/month</span>
                </div>

                <ul className="mt-10 space-y-3.5">
                  {pricingFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm font-light text-cocoa"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cocoa/60"
                        strokeWidth={1.25}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="mt-10 flex w-full items-center justify-center bg-raspberry px-6 py-3.5 text-xs font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-raspberry-dark"
                >
                  Begin Your Trial
                </Link>
              </div>
            </ScrollRevealGroup>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="bg-raspberry px-6 py-16 text-center sm:py-20">
        <ScrollReveal>
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-10 h-px w-16 bg-gold/50" aria-hidden="true" />
            <BrandWordmark href="/" variant="footer" />
            <p className="mt-5 text-xs font-light tracking-[0.06em] text-dusty-cream/50">
              Compliance specialists for the modern property manager
            </p>
            <p className="mt-10 text-[11px] font-light tracking-wide text-dusty-cream/30">
              © {new Date().getFullYear()} Fretwell &amp; Co. All rights reserved.
            </p>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
