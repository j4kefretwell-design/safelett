"use client";

import Link from "next/link";
import { useState } from "react";
import { Key, Menu, Shield, Sparkles, X } from "lucide-react";
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
      "Certificate tracking for all property types",
      "Gas Safety, EICR, EPC, Fire Risk Assessment and all certificate types",
      "Automated email alerts at 60, 30 and 7 days",
      "Contractor directory and email drafting",
      "Annual compliance report PDF",
      "Landlord portal sharing",
      "Bulk property import",
      "Compliance news feed",
      "14 day free trial",
    ],
    ctaClass: btnLandingPrimaryClassName,
    highlighted: false,
  },
  {
    name: "Tenancy",
    price: 35,
    description: "Full tenancy lifecycle management",
    features: [
      "Full tenancy lifecycle tracking",
      "Deposit protection monitoring",
      "Tenancy renewal and rent review alerts",
      "Right to rent expiry tracking",
      "Professional notice drafting",
      "Tenant directory",
      "Document storage",
      "Bulk tenancy import",
      "14 day free trial",
    ],
    ctaClass: btnLandingPrimaryClassName,
    highlighted: false,
  },
  {
    name: "Professional",
    price: 89,
    description:
      "Compliance, Tenancy and AI Assistant — the complete platform",
    features: [
      "Everything in Compliance",
      "Everything in Tenancy",
      "AI Property Management Assistant",
      "Draft any letter, answer any question, handle any admin",
      "Priority support",
      "Save £76/month vs buying separately",
      "14 day free trial",
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
    borderColor: "#33181C",
    tintBg: "rgba(51, 24, 28, 0.10)",
    headingClass: "text-raspberry",
    watermarkClass: "text-raspberry",
    href: "/signup",
    comingSoon: false,
  },
  {
    title: "Tenancy",
    subtitle: "Deposit tracking, renewal dates, tenancy notices",
    price: "£35/month",
    borderColor: "#1B2A4A",
    tintBg: "rgba(27, 42, 74, 0.10)",
    headingClass: "text-navy",
    watermarkClass: "text-navy",
    href: "/signup",
    comingSoon: false,
  },
  {
    title: "AI Assistant",
    subtitle:
      "Property Management Assistant — drafting, compliance review and portfolio Q&A",
    price: "Included in Professional",
    borderColor: "#1A2E1A",
    tintBg: "rgba(26, 46, 26, 0.10)",
    headingClass: "text-forest",
    watermarkClass: "text-forest",
    href: "/signup",
    comingSoon: false,
  },
] as const;

const features = [
  {
    number: "01",
    module: "Compliance",
    body: "Certificate tracking, automated alerts and contractor email drafting across your entire property portfolio.",
    accentColor: "#33181C",
  },
  {
    number: "02",
    module: "Tenancy",
    body: "Deposit protection monitoring, tenancy renewal alerts and professional notice drafting for every tenancy.",
    accentColor: "#1B2A4A",
  },
  {
    number: "03",
    module: "AI Assistant",
    body: "Your Property Management Assistant for drafting correspondence, reviewing compliance and managing your portfolio.",
    accentColor: "#1A2E1A",
  },
];

const mobileNavLinks = [
  { href: "#why", label: "Why Us" },
  { href: "#features", label: "Modules" },
  { href: "#modules", label: "Platform" },
  { href: "#pricing", label: "Pricing" },
  { href: "/login", label: "Sign In" },
  { href: "/signup", label: "Begin Trial" },
];

function SectionRule() {
  return (
    <div className="h-px w-full bg-gold/50" aria-hidden="true" />
  );
}

export default function LandingPage({
  accountDeleted = false,
}: {
  accountDeleted?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="overflow-x-hidden bg-greige text-umber">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gold/50 bg-greige">
        <div className="relative mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:h-[4.75rem] sm:px-10">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="touch-target shrink-0 text-umber"
          >
            {menuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.25} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.25} />
            )}
          </button>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandWordmark href="/" variant="landingNav" className="pointer-events-auto" />
          </div>

          <Link
            href="/login"
            className="shrink-0 text-[11px] font-light uppercase tracking-[0.18em] text-umber/70 transition hover:text-umber"
          >
            Sign In
          </Link>
        </div>

        {menuOpen && (
          <div className="border-t border-gold/30 bg-greige px-4 py-4">
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

      {accountDeleted ? (
        <div
          role="status"
          className="fixed inset-x-0 top-[4.25rem] z-40 border-b border-gold/40 bg-[#F5F0E8] px-4 py-3 text-center text-sm font-medium text-umber sm:top-[4.75rem]"
        >
          Your account has been deleted.
        </div>
      ) : null}

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

        <div className="absolute inset-x-6 bottom-6 z-10 md:inset-x-auto md:bottom-10 md:left-10 md:max-w-[420px] lg:bottom-12 lg:left-12 lg:max-w-[480px]">
          <ScrollRevealGroup
            className="space-y-4 bg-[rgba(61,43,31,0.65)] px-10 py-8"
            staggerMs={100}
          >
            <h1 className="font-serif text-3xl leading-tight tracking-[0.02em] text-dusty-cream sm:text-5xl sm:leading-[1.08]">
              Protecting What Matters Most.
            </h1>
            <p className="text-base font-light leading-relaxed text-dusty-cream/90 sm:text-lg">
              Compliance and tenancy management for property professionals
              across the United Kingdom.
            </p>
          </ScrollRevealGroup>
        </div>
      </section>

      <SectionRule />

      <ScrollReveal>
        <section id="modules" className="bg-greige px-5 py-20 sm:px-10 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-6xl">
            <ScrollRevealGroup className="mx-auto max-w-3xl text-center" staggerMs={100}>
              <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-umber/70">
                One Platform. Three Modules.
              </p>
              <h2 className="mt-6 font-serif text-3xl tracking-[0.02em] text-umber sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Built for the Modern Property Manager.
              </h2>
            </ScrollRevealGroup>

            <div className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-umber/15">
              {moduleCards.map((card, index) => {
                const WatermarkIcon =
                  card.title === "Compliance"
                    ? Shield
                    : card.title === "Tenancy"
                      ? Key
                      : Sparkles;

                const content = (
                  <div
                    className={`relative flex h-full flex-col overflow-hidden border-l-4 px-8 py-10 sm:px-10 sm:py-12 lg:px-12 ${
                      card.comingSoon ? "opacity-85" : "transition duration-300 hover:brightness-[0.98]"
                    }`}
                    style={{
                      borderLeftColor: card.borderColor,
                      backgroundColor: card.tintBg,
                    }}
                  >
                    <WatermarkIcon
                      className={`pointer-events-none absolute -right-4 -bottom-4 h-28 w-28 opacity-[0.07] ${card.watermarkClass}`}
                      strokeWidth={1}
                      aria-hidden="true"
                    />
                    <h3
                      className={`relative font-serif text-2xl tracking-wide sm:text-[1.75rem] ${card.headingClass}`}
                    >
                      {card.title}
                    </h3>
                    <p className="relative mt-4 flex-1 text-sm font-light leading-relaxed text-cocoa">
                      {card.subtitle}
                    </p>
                    <p
                      className={`relative mt-8 text-sm tracking-[0.06em] text-gold ${
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

            <div className="mt-16 text-center">
              <Link
                href="/signup"
                className={`${btnLandingPrimaryClassName} w-full sm:w-auto`}
              >
                Begin Your Trial
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <SectionRule />

      <ScrollReveal>
        <section id="why" className="grid min-h-0 bg-greige lg:min-h-[560px] lg:grid-cols-2">
          <div
            className="relative min-h-[240px] overflow-hidden sm:min-h-[320px] lg:min-h-full"
            style={{ backgroundColor: siteImages.bradStarkey.placeholderColor }}
          >
            <BackgroundImage
              image={siteImages.bradStarkey}
              alt="Refined interior"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
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

      <SectionRule />

      <ScrollReveal>
        <section
          id="features"
          className="bg-greige px-5 py-16 sm:px-10 sm:py-32 lg:py-40"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3 lg:gap-0">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.number} delay={index * 100}>
                <div
                  className={`border-l-[3px] px-2 py-4 sm:px-6 lg:px-10 lg:py-6 ${
                    index < features.length - 1
                      ? "lg:border-r lg:border-umber/10"
                      : ""
                  }`}
                  style={{ borderLeftColor: feature.accentColor }}
                >
                  <p className="text-base font-light tracking-[0.2em] text-gold">
                    {feature.number}
                  </p>
                  <div className="mt-6 h-px w-12 bg-gold/50" />
                  <h3 className="mt-8 font-serif text-xl tracking-[0.02em] text-umber sm:text-2xl">
                    {feature.module}
                  </h3>
                  <p className="mt-5 text-base font-light leading-relaxed text-leather sm:text-lg">
                    {feature.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <SectionRule />

      <ScrollReveal>
        <section className="grid min-h-0 bg-[#1A0A0C] lg:min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-[#1A0A0C] px-5 py-14 sm:px-14 sm:py-20 lg:px-16 lg:py-28">
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
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>
      </ScrollReveal>

      <SectionRule />

      <ScrollReveal>
        <section id="pricing" className="bg-greige-alt px-5 py-16 sm:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <ScrollRevealGroup className="space-y-6" staggerMs={100}>
              <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-umber/70">
                Simple Pricing
              </p>
              <h2 className="font-serif text-2xl tracking-[0.02em] text-umber sm:text-4xl">
                Three Plans. Built for Property Professionals.
              </h2>

              <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col border px-6 py-10 sm:px-8 sm:py-12 ${
                      plan.highlighted
                        ? "border-ink/20 bg-white shadow-[0_20px_60px_rgba(26,10,12,0.08)]"
                        : "border-umber/15 bg-greige"
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute right-0 top-0 bg-[#C4A35A] px-3 py-1.5 text-[10px] font-normal uppercase tracking-[0.18em] text-ink">
                        Best Value
                      </span>
                    )}
                    <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-umber/70">
                      {plan.name}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="font-serif text-5xl tracking-wide text-umber">
                        £{plan.price}
                      </span>
                      <span className="text-base font-light text-umber/70">/month</span>
                    </div>
                    <p className="mt-4 text-sm font-light leading-relaxed text-umber/75">
                      {plan.description}
                    </p>

                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-[13px] font-light leading-relaxed text-umber/80"
                        >
                          <span className="mt-0.5 shrink-0 text-[#C4A35A]" aria-hidden>
                            ✓
                          </span>
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

              <div className="mx-auto mt-10 max-w-xl border border-umber/15 bg-greige px-6 py-6 text-center">
                <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-umber/70">
                  Bundle Savings
                </p>
                <p className="mt-3 text-sm font-light leading-relaxed text-umber/80">
                  Compliance + Tenancy: <strong className="font-normal">£55/month</strong>{" "}
                  (save £10)
                </p>
                <p className="mt-1.5 text-sm font-light leading-relaxed text-umber/80">
                  Professional: <strong className="font-normal">£89/month</strong>{" "}
                  (save £76 vs buying separately)
                </p>
              </div>
            </ScrollRevealGroup>
          </div>
        </section>
      </ScrollReveal>

      <SectionRule />

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
            <p className="mt-3 text-[10px] font-light tracking-wide text-dusty-cream/60">
              ICO Registration No. ZC199325
            </p>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
