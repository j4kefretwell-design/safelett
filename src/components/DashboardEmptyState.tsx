import Link from "next/link";
import { ArrowRight, Building2, FileCheck, Sparkles } from "lucide-react";
import { btnPrimaryClassName, cardClassName } from "@/lib/ui";

const steps = [
  {
    number: "1",
    title: "Add your first property",
    description:
      "Enter the address and details for a rental in your portfolio. You can add more whenever you're ready.",
    icon: Building2,
  },
  {
    number: "2",
    title: "Upload your certificates",
    description:
      "Attach Gas Safety, EICR, EPC, and every other compliance document in one organised place.",
    icon: FileCheck,
  },
  {
    number: "3",
    title: "Stay automatically compliant",
    description:
      "We'll watch expiry dates and send gentle reminders at 60, 30, and 7 days — so nothing slips through.",
    icon: Sparkles,
  },
];

export default function DashboardEmptyState() {
  return (
    <div className={`${cardClassName} relative overflow-hidden px-8 py-14 sm:px-12 sm:py-16`}>
      <div className="property-card-texture pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative text-center">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">
          Welcome to Fretwell &amp; Co
        </p>
        <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-charcoal sm:text-4xl">
          Your portfolio awaits
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-charcoal-muted">
          You&apos;re a few minutes away from having every certificate tracked,
          every expiry watched, and every renewal handled with confidence.
        </p>
        <Link href="/properties/new" className={`${btnPrimaryClassName} mt-8`}>
          Add Your First Property
        </Link>
      </div>

      <div className="relative mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative text-center md:text-left">
              {index < steps.length - 1 && (
                <div
                  className="absolute top-8 left-[calc(50%+2rem)] hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-gold-light/80 to-transparent md:block"
                  aria-hidden
                />
              )}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-light/60 bg-cream/40 md:mx-0">
                <Icon
                  className="h-5 w-5 text-burgundy"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-gold">
                Step {step.number}
              </p>
              <h3 className="mt-2 font-serif text-lg font-medium text-charcoal">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-12 flex items-center justify-center gap-2 text-sm text-charcoal-muted">
        <span>Add your first property</span>
        <ArrowRight className="h-4 w-4 text-gold" strokeWidth={1.75} />
        <span>Upload certificates</span>
        <ArrowRight className="h-4 w-4 text-gold" strokeWidth={1.75} />
        <span className="hidden sm:inline">Stay automatically compliant</span>
      </div>
    </div>
  );
}
