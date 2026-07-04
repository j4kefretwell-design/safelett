"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Menu, X } from "lucide-react";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import ScrollReveal, { ScrollRevealGroup } from "@/components/ScrollReveal";
import { siteImages } from "@/lib/site-images";
import { btnHeroTrialClassName, btnOutlineClassName, btnPrimaryClassName } from "@/lib/ui";

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

const mobileNavLinks = [
  { href: "#why", label: "Why Fretwell & Co" },
  { href: "#features", label: "Features" },
  { href: "/login", label: "Sign In" },
  { href: "/signup", label: "Begin Trial" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="overflow-x-hidden bg-dusty-cream text-text">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gold bg-raspberry">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-10">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="touch-target text-dusty-cream md:hidden"
          >
            {menuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.25} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.25} />
            )}
          </button>

          <div className="flex flex-1 justify-center md:justify-center">
            <BrandWordmark href="/" variant="nav" />
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#why"
              className="text-sm font-light tracking-[0.1em] text-dusty-cream/90 transition hover:text-dusty-cream"
            >
              Why Us
            </a>
            <a
              href="#features"
              className="text-sm font-light tracking-[0.1em] text-dusty-cream/90 transition hover:text-dusty-cream"
            >
              Features
            </a>
            <Link
              href="/login"
              className="text-sm font-light tracking-[0.1em] text-dusty-cream/90 transition hover:text-dusty-cream"
            >
              Sign In
            </Link>
          </div>

          <div className="w-11 md:hidden" aria-hidden="true" />
        </div>

        {menuOpen && (
          <div className="border-t border-gold/30 bg-raspberry px-4 py-4 md:hidden">
            <ul className="space-y-1">
              {mobileNavLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("#") ? (
                    <a
                      href={link.href}
                      onClick={closeMenu}
                      className="flex min-h-11 items-center text-sm font-light uppercase tracking-[0.12em] text-dusty-cream"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="flex min-h-11 items-center text-sm font-light uppercase tracking-[0.12em] text-dusty-cream"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <section
        className="relative flex min-h-[85vh] flex-col overflow-hidden pt-16 sm:min-h-screen"
        style={{ backgroundColor: siteImages.anthonyFomin.placeholderColor }}
      >
        <BackgroundImage
          image={siteImages.anthonyFomin}
          alt="Elegant property exterior"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#1A0A0C]/55" />

        <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-14 pt-10 sm:px-12 sm:pb-28 lg:px-16">
          <ScrollRevealGroup className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6" staggerMs={100}>
            <p className="text-on-image caps-label text-dusty-cream">
              Property Compliance Specialists
            </p>
            <h1 className="text-on-image max-w-3xl font-serif text-3xl leading-tight tracking-[0.02em] text-dusty-cream sm:text-5xl sm:leading-[1.08] lg:text-7xl">
              Protecting What Matters Most.
            </h1>
            <div className="h-px w-20 bg-gold" aria-hidden="true" />
            <p className="text-on-image max-w-lg text-base font-light leading-relaxed text-dusty-cream/90 sm:text-lg">
              Automated compliance tracking for property management
              professionals across the United Kingdom.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/signup"
                className={`${btnHeroTrialClassName} w-full sm:w-auto`}
              >
                Begin Your Trial
              </Link>
              <a
                href="#why"
                className="inline-flex min-h-11 w-full items-center justify-center border border-dusty-cream/50 px-8 py-3 text-[0.9375rem] font-light uppercase tracking-[0.14em] text-dusty-cream transition hover:border-dusty-cream hover:bg-dusty-cream/5 sm:w-auto"
              >
                Learn More
              </a>
            </div>
          </ScrollRevealGroup>
        </div>
      </section>

      <div className="h-px w-full bg-gold" aria-hidden="true" />

      <ScrollReveal>
        <section id="why" className="grid min-h-0 lg:min-h-[560px] lg:grid-cols-2">
          <div
            className="relative min-h-[240px] overflow-hidden sm:min-h-[320px] lg:min-h-full"
            style={{ backgroundColor: siteImages.bradStarkey.placeholderColor }}
          >
            <BackgroundImage
              image={siteImages.bradStarkey}
              alt="Refined interior"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-[#1A0A0C]/25" />
          </div>

          <div className="flex flex-col justify-center px-5 py-14 sm:px-14 sm:py-20 lg:px-16 lg:py-28">
            <ScrollRevealGroup className="max-w-md space-y-6" staggerMs={100}>
              <p className="caps-label text-cocoa">Why Fretwell &amp; Co</p>
              <h2 className="font-serif text-2xl leading-snug tracking-[0.02em] text-text sm:text-4xl lg:text-[2.75rem]">
                The Standard of Care Your Portfolio Deserves.
              </h2>
              <p className="text-base font-light leading-relaxed text-cocoa sm:text-lg">
                Property compliance is fragmented, time-consuming, and
                unforgiving. Missed renewals carry real consequences — for your
                tenants, your reputation, and your business.
              </p>
              <p className="text-base font-light leading-relaxed text-cocoa/80 sm:text-lg">
                Fretwell &amp; Co brings every certificate, every deadline, and
                every document into one considered system — so you lead with
                confidence, not anxiety.
              </p>
              <a
                href="#features"
                className={`${btnOutlineClassName} w-full sm:w-auto`}
              >
                Discover More →
              </a>
            </ScrollRevealGroup>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section
          id="features"
          className="bg-raspberry px-5 py-16 sm:px-10 sm:py-32 lg:py-40"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3 lg:gap-0">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.number} delay={index * 100}>
                <div
                  className={`px-2 py-4 sm:px-6 lg:px-10 lg:py-6 ${
                    index < features.length - 1
                      ? "lg:border-r lg:border-gold/25"
                      : ""
                  }`}
                >
                  <p className="text-base font-light tracking-[0.2em] text-gold">
                    {feature.number}
                  </p>
                  <div className="mt-6 h-px w-12 bg-gold/60" />
                  <h3 className="mt-8 font-serif text-xl tracking-[0.02em] text-dusty-cream sm:text-2xl lg:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-5 text-base font-light leading-relaxed text-dusty-cream/80 sm:text-lg">
                    {feature.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="grid min-h-0 lg:min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-beige px-5 py-14 sm:px-14 sm:py-20 lg:px-16 lg:py-28">
            <ScrollRevealGroup className="max-w-lg space-y-8" staggerMs={100}>
              <blockquote>
                <p className="font-serif text-2xl italic leading-snug tracking-[0.01em] text-text sm:text-4xl lg:text-[2.5rem] lg:leading-snug">
                  &ldquo;Every deadline met. Every certificate tracked. Every
                  property protected.&rdquo;
                </p>
              </blockquote>
              <Link
                href="/signup"
                className="inline-block text-base font-light leading-relaxed tracking-[0.08em] text-cocoa underline-offset-4 transition hover:text-text hover:underline"
              >
                Start Free Trial →
              </Link>
            </ScrollRevealGroup>
          </div>

          <div
            className="relative min-h-[240px] overflow-hidden sm:min-h-[320px] lg:min-h-full"
            style={{ backgroundColor: siteImages.hugoKruip.placeholderColor }}
          >
            <BackgroundImage
              image={siteImages.hugoKruip}
              alt="Architectural detail"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="bg-dusty-cream px-5 py-16 sm:py-32">
          <div className="mx-auto max-w-lg text-center">
            <ScrollRevealGroup className="space-y-6" staggerMs={100}>
              <p className="caps-label text-cocoa">Simple Pricing</p>
              <h2 className="font-serif text-2xl tracking-[0.02em] text-text sm:text-4xl">
                One Plan. Everything Included.
              </h2>

              <div className="mx-auto mt-10 max-w-sm border border-cocoa/20 bg-beige px-6 py-10 text-left sm:px-10 sm:py-12">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl tracking-wide text-text sm:text-6xl">
                    £49
                  </span>
                  <span className="text-base font-light text-cocoa">/month</span>
                </div>

                <ul className="mt-10 space-y-3.5">
                  {pricingFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-base font-light leading-relaxed text-cocoa"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-cocoa/60"
                        strokeWidth={1.25}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`${btnPrimaryClassName} mt-10 w-full`}
                >
                  Begin Your Trial
                </Link>
              </div>
            </ScrollRevealGroup>
          </div>
        </section>
      </ScrollReveal>

      <footer className="bg-raspberry px-5 py-14 text-center sm:py-20">
        <ScrollReveal>
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-10 h-px w-16 bg-gold/50" aria-hidden="true" />
            <BrandWordmark href="/" variant="footer" />
            <p className="mt-5 text-sm font-light leading-relaxed tracking-[0.06em] text-dusty-cream/70">
              Compliance specialists for the modern property manager
            </p>
            <p className="mt-10 text-xs font-light leading-relaxed tracking-wide text-dusty-cream/50">
              © {new Date().getFullYear()} Fretwell &amp; Co. All rights reserved.
            </p>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
