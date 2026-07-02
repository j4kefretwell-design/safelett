"use client";

import Image from "next/image";
import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import ScrollReveal from "@/components/ScrollReveal";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80";

const features = [
  {
    number: "01",
    title: "Certificate Tracking",
    lines: [
      "Every Gas Safety, EICR, EPC, and fire certificate — organised by property, always current.",
      "Upload documents and see compliance status at a glance across your entire portfolio.",
    ],
  },
  {
    number: "02",
    title: "Automated Alerts",
    lines: [
      "Gentle reminders at 60, 30, and 7 days before expiry — never miss a renewal again.",
      "Contractor details included in every alert, ready for you to act immediately.",
    ],
  },
  {
    number: "03",
    title: "Document Storage",
    lines: [
      "Secure storage for every compliance document, accessible whenever you need them.",
      "A clear audit trail that keeps your portfolio inspection-ready, year after year.",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dusty-cream text-text">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col">
        <Image
          src={HERO_IMAGE}
          alt="Georgian townhouse"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-raspberry/78" />
        <div className="absolute inset-0 bg-gradient-to-b from-raspberry/40 via-transparent to-raspberry/90" />

        <div className="relative z-10 flex flex-1 flex-col px-6 pb-16 pt-10 sm:px-10 sm:pb-20 sm:pt-12">
          <div className="flex justify-center">
            <BrandWordmark href="/" variant="hero" />
          </div>

          <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center text-center">
            <h1 className="font-serif text-4xl leading-[1.15] tracking-[0.03em] text-dusty-cream sm:text-6xl lg:text-7xl">
              Property Compliance.
              <br />
              Handled With Care.
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-dusty-cream/70 sm:text-lg">
              The refined way to track certificates, store documents, and stay
              ahead of every deadline across your UK property portfolio.
            </p>
            <Link href="/signup" className="btn-outline-light mt-12">
              Begin Your Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-dusty-cream px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-5xl space-y-24 sm:space-y-32">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.number} delay={index * 80}>
              <article className="max-w-2xl">
                <p className="text-sm font-light tracking-[0.2em] text-cocoa">
                  {feature.number}
                </p>
                <div className="mt-6 h-px w-full max-w-xs bg-cocoa/25" />
                <h2 className="mt-8 font-serif text-3xl tracking-[0.03em] text-text sm:text-4xl">
                  {feature.title}
                </h2>
                <p className="mt-6 text-base font-light leading-relaxed text-cocoa">
                  {feature.lines[0]}
                </p>
                <p className="mt-4 text-base font-light leading-relaxed text-cocoa/80">
                  {feature.lines[1]}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Quote panel */}
      <ScrollReveal>
        <section className="bg-raspberry px-6 py-32 sm:py-40">
          <blockquote className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-3xl italic leading-snug tracking-[0.02em] text-dusty-cream sm:text-4xl lg:text-5xl">
              &ldquo;Every property. Every certificate. Every deadline. Managed.&rdquo;
            </p>
          </blockquote>
        </section>
      </ScrollReveal>

      {/* Pricing */}
      <section className="bg-dusty-cream px-6 py-28 sm:py-36">
        <ScrollReveal>
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm font-light tracking-[0.18em] text-cocoa uppercase">
              Pricing
            </p>
            <div className="mt-10 h-px w-16 bg-gold/60 mx-auto" />
            <div className="mt-12">
              <p className="font-serif text-6xl tracking-wide text-text">£49</p>
              <p className="mt-2 text-sm font-light text-cocoa">per month</p>
            </div>
            <p className="mx-auto mt-8 max-w-sm text-sm font-light leading-relaxed text-cocoa">
              Unlimited properties. All certificate types. Automated alerts,
              document storage, and contractor contacts — everything included.
            </p>
            <Link href="/signup" className="btn-outline-dark mt-12 inline-flex">
              Begin Your Trial
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="bg-raspberry px-6 py-14 sm:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-between">
          <BrandWordmark href="/" variant="footer" />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-light tracking-wide text-dusty-cream/60">
            <Link href="/login" className="transition hover:text-dusty-cream">
              Sign In
            </Link>
            <Link href="/signup" className="transition hover:text-dusty-cream">
              Start Trial
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-10 max-w-5xl text-center text-xs font-light text-dusty-cream/35 sm:text-left">
          Property compliance for UK property managers
        </p>
      </footer>
    </div>
  );
}
