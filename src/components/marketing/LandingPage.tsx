import Link from "next/link";
import {
  Bell,
  Building2,
  Check,
  FileText,
  Shield,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { btnPrimaryClassName, btnSecondaryClassName } from "@/lib/ui";

const features = [
  {
    icon: Shield,
    title: "Certificate Tracking",
    description:
      "Gas Safety, EICR, EPC, fire assessments, and more — every certificate for every property, always up to date.",
  },
  {
    icon: Bell,
    title: "Automated Alerts",
    description:
      "Gentle email reminders at 60, 30, and 7 days before expiry, with contractor details ready to hand.",
  },
  {
    icon: FileText,
    title: "Document Storage",
    description:
      "Upload and access compliance documents securely, with a clear audit trail across your entire portfolio.",
  },
];

const pricingFeatures = [
  "Unlimited properties",
  "All 13 certificate types",
  "Automated expiry alerts",
  "Document storage",
  "Contractor contacts",
  "CSV export & bulk import",
  "Landlord sharing portal",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <header className="border-b border-gold-light/40 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="font-serif text-xl font-medium tracking-tight text-burgundy sm:text-2xl"
          >
            {BRAND_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className={btnSecondaryClassName}>
              Sign In
            </Link>
            <Link href="/signup" className={btnPrimaryClassName}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-texture relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold/90">
            {BRAND_NAME}
          </p>
          <h1 className="mt-6 font-serif text-5xl font-medium tracking-tight text-cream sm:text-6xl lg:text-7xl">
            Property Compliance.
            <br />
            <span className="text-gold">Handled.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg">
            Track certificates, store documents, and receive automated renewal
            reminders across your entire UK property portfolio — with the calm
            confidence of a well-run estate.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-[7px] bg-gold px-8 py-3 text-sm font-medium tracking-[0.04em] text-burgundy shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.2)] transition hover:bg-gold-light"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-[7px] border border-cream/25 px-8 py-3 text-sm font-medium tracking-[0.04em] text-cream transition hover:border-gold/50 hover:text-gold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">
              Why {BRAND_NAME}
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-charcoal sm:text-4xl">
              Everything you need to stay compliant
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="heritage-card rounded-[6px] border border-gold-light/50 bg-panel p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-light/60 bg-cream/30">
                    <Icon
                      className="h-5 w-5 text-burgundy"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-medium text-charcoal">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-gold-light/40 bg-cream/20 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">
            Simple pricing
          </p>
          <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-charcoal">
            One plan. Everything included.
          </h2>

          <div className="heritage-plaque mt-10 rounded-[6px] px-8 py-10 text-left">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-5xl font-medium text-charcoal">
                £49
              </span>
              <span className="text-sm text-charcoal-muted">/ month</span>
            </div>
            <p className="mt-3 text-sm text-charcoal-muted">
              Full access to every feature. No per-property fees.
            </p>

            <ul className="mt-8 space-y-3">
              {pricingFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-charcoal"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-compliant"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/signup" className={`${btnPrimaryClassName} mt-10 w-full`}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl">
          <Building2
            className="mx-auto h-8 w-8 text-gold"
            strokeWidth={1.5}
            aria-hidden
          />
          <h2 className="mt-6 font-serif text-3xl font-medium tracking-tight text-charcoal">
            Ready to take control of compliance?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal-muted">
            Join property managers who trust {BRAND_NAME} to keep their
            portfolios compliant, organised, and audit-ready.
          </p>
          <Link href="/signup" className={`${btnPrimaryClassName} mt-8`}>
            Start Free Trial
          </Link>
        </div>
      </section>

      <footer className="border-t border-gold-light/40 bg-burgundy px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-serif text-lg font-medium text-gold">
            {BRAND_NAME}
          </p>
          <p className="text-sm text-cream/50">
            Property compliance tracking for UK property managers
          </p>
        </div>
      </footer>
    </div>
  );
}
