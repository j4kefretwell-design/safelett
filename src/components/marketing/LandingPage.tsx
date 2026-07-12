"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Key, Menu, Shield, Sparkles, X } from "lucide-react";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import ScrollReveal, { ScrollRevealGroup } from "@/components/ScrollReveal";
import { siteImages } from "@/lib/site-images";
import {
  btnLandingOutlineClassName,
  btnLandingPrimaryClassName,
} from "@/lib/ui";

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
    ctaClass: btnLandingPrimaryClassName,
  },
  {
    name: "Professional",
    price: 89,
    description: "Compliance + Tenancy — save £76/month",
    features: [
      "Everything in Compliance",
      "Everything in Tenancy",
      "AI Assistant (coming soon)",
      "Priority support",
      "Bundle pricing — £55 for both modules",
    ],
    ctaClass: `${btnLandingPrimaryClassName} bg-ink hover:bg-ink/90`,
    highlighted: true,
  },
];

const moduleCards = [
  {
    title: "Compliance",
    subtitle:
      "Certificate tracking, automated alerts, contractor management",
    price: "£30/month",
    background: "bg-raspberry",
    icon: Shield,
    href: "/signup",
    comingSoon: false,
  },
  {
    title: "Tenancy",
    subtitle: "Deposit tracking, renewal dates, tenancy notices",
    price: "£35/month",
    background: "bg-navy",
    icon: Key,
    href: "/signup",
    comingSoon: false,
  },
  {
    title: "AI Assistant",
    subtitle:
      "Intelligent admin drafting and property management automation",
    price: "Coming Soon",
    background: "bg-forest",
    icon: Sparkles,
    href: null,
    comingSoon: true,
  },
] as const;

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
  { href: "#modules", label: "Modules" },
  { href: "#pricing", label: "Pricing" },
  { href: "/login", label: "Sign In" },
  { href: "/signup", label: "Begin Trial" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="overflow-x-hidden bg-greige text-umber">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gold/50 bg-greige">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-10">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="touch-target text-umber md:hidden"
          >
            {menuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.25} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.25} />
            )}
          </button>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandWordmark href="/" variant="greige" className="pointer-events-auto" />
          </div>

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            <a
              href="#why"
              className="text-sm font-light tracking-[0.1em] text-umber/80 transition hover:text-umber"
            >
              Why Us
            </a>
            <a
              href="#features"
              className="text-sm font-light tracking-[0.1em] text-umber/80 transition hover:text-umber"
            >
              Compliance
            </a>
            <a
              href="#modules"
              className="text-sm font-light tracking-[0.1em] text-umber/80 transition hover:text-umber"
            >
              Modules
            </a>
            <Link
              href="/login"
              className={`${btnLandingPrimaryClassName} px-5 py-2 text-xs tracking-[0.12em]`}
            >
              Sign In
            </Link>
          </div>

          <div className="w-11 md:hidden" aria-hidden="true" />
        </div>

        {menuOpen && (
          <div className="border-t border-gold/30 bg-greige px-4 py-4 md:hidden">
            <ul className="space-y-1">
              {mobileNavLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("#") ? (
                    <a
                      href={link.href}
                      onClick={closeMenu}
                      className="flex min-h-11 items-center text-sm font-light uppercase tracking-[0.12em] text-umber"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex min-h-11 items-center text-sm font-light uppercase tracking-[0.12em] ${
                        link.href === "/login"
                          ? "font-normal text-umber"
                          : "text-umber"
                      }`}
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
        <div className="absolute inset-0 bg-[#1A0A0C]/15" />

        <div className="absolute inset-x-6 bottom-6 z-10 md:inset-x-auto md:bottom-10 md:left-10 md:max-w-[420px] lg:bottom-12 lg:left-12 lg:max-w-[520px]">
          <ScrollRevealGroup
            className="space-y-5 sm:space-y-6 [&_*]:[text-shadow:0_2px_20px_rgba(0,0,0,0.9)]"
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
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4 [&_a]:[text-shadow:none]">
              <Link
                href="/signup"
                className={`${btnLandingPrimaryClassName} w-full sm:w-auto`}
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
        <section id="why" className="grid min-h-0 bg-greige lg:min-h-[560px] lg:grid-cols-2">
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

          <div className="flex flex-col justify-center bg-greige-alt px-5 py-14 sm:px-14 sm:py-20 lg:px-16 lg:py-28">
            <ScrollRevealGroup className="max-w-md space-y-6" staggerMs={100}>
              <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-umber/70">
                Why Fretwell &amp; Co
              </p>
              <h2 className="font-serif text-2xl leading-snug tracking-[0.02em] text-umber sm:text-4xl lg:text-[2.75rem]">
                The Standard of Care Your Portfolio Deserves.
              </h2>
              <p className="text-base font-light leading-relaxed text-umber/80 sm:text-lg">
                Property compliance is fragmented, time-consuming, and
                unforgiving. Missed renewals carry real consequences — for your
                tenants, your reputation, and your business.
              </p>
              <p className="text-base font-light leading-relaxed text-umber/65 sm:text-lg">
                Fretwell &amp; Co brings every certificate, every deadline, and
                every document into one considered system — so you lead with
                confidence, not anxiety.
              </p>
              <a
                href="#features"
                className={`${btnLandingOutlineClassName} w-full sm:w-auto`}
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
          className="bg-ink px-5 py-16 sm:px-10 sm:py-32 lg:py-40"
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
        <section id="modules" className="bg-greige px-5 py-16 sm:px-10 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-6xl text-center">
            <ScrollRevealGroup className="space-y-5" staggerMs={100}>
              <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-umber/70">
                One Platform. Three Modules.
              </p>
              <div className="mx-auto h-px w-16 bg-gold" aria-hidden="true" />
              <h2 className="font-serif text-3xl tracking-[0.02em] text-umber sm:text-4xl lg:text-5xl">
                Everything a property manager needs.
              </h2>
            </ScrollRevealGroup>

            <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
              {moduleCards.map((card, index) => {
                const Icon = card.icon;
                const content = (
                  <div
                    className={`group flex h-full flex-col px-8 py-10 text-left transition duration-300 sm:px-10 sm:py-12 ${card.background} ${
                      card.comingSoon ? "opacity-80" : "hover:ring-2 hover:ring-gold/70"
                    }`}
                  >
                    <Icon
                      className="h-6 w-6 text-gold"
                      strokeWidth={1.25}
                      aria-hidden="true"
                    />
                    <h3 className="mt-8 font-serif text-2xl tracking-wide text-dusty-cream sm:text-3xl">
                      {card.title}
                    </h3>
                    <p className="mt-4 flex-1 text-base font-light leading-relaxed text-dusty-cream/80">
                      {card.subtitle}
                    </p>
                    <p
                      className={`mt-8 text-sm tracking-[0.08em] text-gold ${
                        card.comingSoon ? "italic" : "font-normal uppercase"
                      }`}
                    >
                      {card.price}
                    </p>
                  </div>
                );

                return (
                  <ScrollReveal key={card.title} delay={index * 100}>
                    {card.href ? (
                      <Link href={card.href} className="block h-full">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </ScrollReveal>
                );
              })}
            </div>

            <Link
              href="/signup"
              className={`${btnLandingPrimaryClassName} mt-12 w-full sm:w-auto`}
            >
              Begin Your Trial
            </Link>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="grid min-h-0 bg-ink lg:min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-14 sm:py-20 lg:px-16 lg:py-28">
            <ScrollRevealGroup className="max-w-lg space-y-8" staggerMs={100}>
              <blockquote>
                <p className="font-serif text-2xl italic leading-snug tracking-[0.01em] text-dusty-cream sm:text-4xl lg:text-[2.5rem] lg:leading-snug">
                  &ldquo;Every deadline met. Every certificate tracked. Every
                  property protected.&rdquo;
                </p>
              </blockquote>
              <Link
                href="/signup"
                className="inline-block text-base font-light leading-relaxed tracking-[0.08em] text-gold underline-offset-4 transition hover:text-dusty-cream hover:underline"
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
        <section id="pricing" className="bg-greige-alt px-5 py-16 sm:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <ScrollRevealGroup className="space-y-6" staggerMs={100}>
              <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-umber/70">
                Simple Pricing
              </p>
              <h2 className="font-serif text-2xl tracking-[0.02em] text-umber sm:text-4xl">
                Two Plans. Built for Property Professionals.
              </h2>

              <div className="mt-12 grid gap-6 text-left md:grid-cols-2">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`border px-6 py-10 sm:px-10 sm:py-12 ${
                      plan.highlighted
                        ? "border-ink/20 bg-white shadow-[0_20px_60px_rgba(26,10,12,0.08)]"
                        : "border-umber/15 bg-greige"
                    }`}
                  >
                    <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-umber/70">
                      {plan.name}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="font-serif text-5xl tracking-wide text-umber sm:text-6xl">
                        £{plan.price}
                      </span>
                      <span className="text-base font-light text-umber/70">/month</span>
                    </div>
                    <p className="mt-4 text-sm font-light leading-relaxed text-umber/75">
                      {plan.description}
                    </p>

                    <ul className="mt-10 space-y-3.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-base font-light leading-relaxed text-umber/80"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
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

      <footer className="bg-ink px-5 py-14 text-center sm:py-20">
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
