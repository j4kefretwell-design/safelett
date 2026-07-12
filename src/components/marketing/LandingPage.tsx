"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Menu, X } from "lucide-react";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import ScrollReveal, { ScrollRevealGroup } from "@/components/ScrollReveal";
import { siteImages } from "@/lib/site-images";
import { btnHeroTrialClassName, btnOutlineClassName, btnPrimaryClassName } from "@/lib/ui";

const pricingPlans = [
  {
    name: "Compliance",
    price: 30,
    description: "Certificate tracking for property managers",
    features: [
      "Unlimited properties",
      "All 13 certificate types",
      "Automated expiry alerts",
      "Contractor email drafts",
      "Annual compliance report",
      "CSV export & bulk import",
    ],
    ctaClass: btnPrimaryClassName,
  },
  {
    name: "Professional",
    price: 49,
    description: "Compliance plus full tenancy management",
    features: [
      "Everything in Compliance",
      "Full tenancy management",
      "Renewal & rent review alerts",
      "Deposit protection tracking",
      "Tenancy notice drafts",
      "Right to rent monitoring",
    ],
    ctaClass: `${btnPrimaryClassName} bg-navy hover:bg-navy-dark`,
    highlighted: true,
  },
];

const features = [
  {
    number: "01",
    title: "Intelligent Certificate Tracking",
    body: "Every gas safety check, EICR, fire risk assessment, EPC and more — tracked automatically across your entire portfolio. Never manually chase a spreadsheet again. Fretwell & Co tells you exactly what needs attention, on which property, and when.",
  },
  {
    number: "02",
    title: "Automated Alerts & Contractor Actions",
    body: "When a certificate is approaching expiry, Fretwell & Co doesn't just tell you — it drafts a professional email to your contractor, ready to send in one click. Your compliance stays ahead of deadlines without the administrative burden.",
  },
  {
    number: "03",
    title: "Portfolio Oversight & Client Reporting",
    body: "Generate a professional annual compliance report for your entire portfolio in seconds. Share a live compliance status link directly with your landlord clients. Present yourself as the organised, professional managing agent your clients expect.",
  },
];

const mobileNavLinks = [
  { href: "#why", label: "Why Fretwell & Co" },
  { href: "#features", label: "Compliance" },
  { href: "#tenancy", label: "Tenancy" },
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
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-10">
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

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandWordmark href="/" variant="nav" className="pointer-events-auto" />
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
              Compliance
            </a>
            <a
              href="#tenancy"
              className="text-sm font-light tracking-[0.1em] text-dusty-cream/90 transition hover:text-dusty-cream"
            >
              Tenancy
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
        <div className="absolute inset-0 bg-[#1A0A0C]/25" />

        <div className="absolute inset-x-6 bottom-6 z-10 md:inset-x-auto md:bottom-10 md:left-10 md:max-w-[420px] lg:bottom-12 lg:left-12 lg:max-w-[520px]">
          <ScrollRevealGroup
            className="space-y-5 bg-[#1A0A0C]/75 px-8 py-10 sm:space-y-6 sm:px-12"
            staggerMs={100}
          >
            <p className="caps-label text-dusty-cream">
              Property Compliance Specialists
            </p>
            <h1 className="font-serif text-3xl leading-tight tracking-[0.02em] text-dusty-cream sm:text-5xl sm:leading-[1.08]">
              Protecting What Matters Most.
            </h1>
            <div className="h-px w-20 bg-gold" aria-hidden="true" />
            <p className="text-base font-light leading-relaxed text-dusty-cream sm:text-lg">
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
            <p className="mt-4 text-[11px] leading-relaxed text-dusty-cream/70 sm:text-xs">
              Fretwell &amp; Co is a compliance tracking tool. Users remain
              responsible for their own legal compliance obligations.
            </p>
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
        <section
          id="tenancy"
          className="bg-navy px-5 py-16 sm:px-10 sm:py-32 lg:py-40"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <ScrollRevealGroup className="space-y-6" staggerMs={100}>
              <p className="caps-label text-gold">Tenancy Management</p>
              <h2 className="font-serif text-3xl tracking-[0.02em] text-dusty-cream sm:text-4xl lg:text-5xl">
                Every Tenancy. Every Deadline. Every Document.
              </h2>
              <p className="text-base font-light leading-relaxed text-dusty-cream/85 sm:text-lg">
                Track lease end dates, rent reviews, deposit protection, and right
                to rent compliance across your entire lettings portfolio — in the
                same considered system as your certificates.
              </p>
              <ul className="space-y-3 text-base font-light leading-relaxed text-dusty-cream/80">
                <li>Automated alerts at 90, 60, and 30 days before tenancy end</li>
                <li>Deposit protection overdue flags</li>
                <li>Professional tenancy notice drafts in one click</li>
                <li>Secure document storage for agreements and certificates</li>
              </ul>
              <Link
                href="/signup"
                className={`${btnOutlineClassName} border-dusty-cream/40 text-dusty-cream hover:border-dusty-cream hover:bg-dusty-cream/5`}
              >
                Start with Professional →
              </Link>
            </ScrollRevealGroup>

            <div
              className="relative min-h-[280px] overflow-hidden sm:min-h-[360px]"
              style={{ backgroundColor: siteImages.bradStarkey.placeholderColor }}
            >
              <BackgroundImage
                image={siteImages.bradStarkey}
                alt="Elegant townhouse exterior"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[#0F1923]/35" />
            </div>
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
        <section id="pricing" className="bg-dusty-cream px-5 py-16 sm:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <ScrollRevealGroup className="space-y-6" staggerMs={100}>
              <p className="caps-label text-cocoa">Simple Pricing</p>
              <h2 className="font-serif text-2xl tracking-[0.02em] text-text sm:text-4xl">
                Two Plans. Built for Property Professionals.
              </h2>

              <div className="mt-12 grid gap-6 text-left md:grid-cols-2">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`border px-6 py-10 sm:px-10 sm:py-12 ${
                      plan.highlighted
                        ? "border-navy/30 bg-white shadow-[0_20px_60px_rgba(27,42,74,0.08)]"
                        : "border-cocoa/20 bg-beige"
                    }`}
                  >
                    <p className="caps-label text-cocoa">{plan.name}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="font-serif text-5xl tracking-wide text-text sm:text-6xl">
                        £{plan.price}
                      </span>
                      <span className="text-base font-light text-cocoa">/month</span>
                    </div>
                    <p className="mt-4 text-sm font-light leading-relaxed text-cocoa">
                      {plan.description}
                    </p>

                    <ul className="mt-10 space-y-3.5">
                      {plan.features.map((feature) => (
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

                    <Link href="/signup" className={`${plan.ctaClass} mt-10 w-full`}>
                      Begin Your Trial
                    </Link>
                  </div>
                ))}
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
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              aria-label="Legal"
            >
              <Link
                href="/privacy-policy"
                className="text-xs font-light uppercase tracking-[0.12em] text-dusty-cream/70 transition hover:text-dusty-cream"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs font-light uppercase tracking-[0.12em] text-dusty-cream/70 transition hover:text-dusty-cream"
              >
                Terms of Service
              </Link>
            </nav>
            <p className="mt-10 text-xs font-light leading-relaxed tracking-wide text-dusty-cream/50">
              © {new Date().getFullYear()} Fretwell &amp; Co. All rights reserved.
            </p>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
