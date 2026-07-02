import Link from "next/link";
import { ArrowRight, Building2, FileCheck, Sparkles } from "lucide-react";
import { btnPrimaryClassName, cardClassName, goldLabelClassName } from "@/lib/ui";

const steps = [
  {
    number: "1",
    title: "Add your first property",
    description:
      "Enter the address and details for a rental in your portfolio.",
    icon: Building2,
  },
  {
    number: "2",
    title: "Upload your certificates",
    description:
      "Attach Gas Safety, EICR, EPC, and every compliance document.",
    icon: FileCheck,
  },
  {
    number: "3",
    title: "Stay automatically compliant",
    description:
      "Gentle reminders at 60, 30, and 7 days — nothing slips through.",
    icon: Sparkles,
  },
];

export default function DashboardEmptyState() {
  return (
    <div className={`${cardClassName} px-8 py-16 sm:px-12 sm:py-20`}>
      <div className="text-center">
        <p className={goldLabelClassName}>Welcome</p>
        <h2 className="mt-5 font-serif text-3xl tracking-wide text-text sm:text-4xl">
          Your portfolio awaits
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed text-cocoa">
          You&apos;re a few minutes away from having every certificate tracked
          and every renewal handled with confidence.
        </p>
        <Link href="/properties/new" className={`${btnPrimaryClassName} mt-10`}>
          Add Your First Property
        </Link>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="text-center md:text-left">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-cocoa/20 md:mx-0">
                <Icon className="h-5 w-5 text-cocoa/60" strokeWidth={1.25} />
              </div>
              <p className="mt-5 text-xs font-light uppercase tracking-[0.16em] text-cocoa">
                Step {step.number}
              </p>
              <h3 className="mt-3 font-serif text-lg tracking-wide text-text">
                {step.title}
              </h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-cocoa">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-center gap-2 text-xs font-light tracking-wide text-cocoa/70">
        <span>Add property</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.25} />
        <span>Upload certificates</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.25} />
        <span>Stay compliant</span>
      </div>
    </div>
  );
}
