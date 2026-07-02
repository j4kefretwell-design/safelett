import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { btnPrimaryClassName, cardClassName, goldLabelClassName } from "@/lib/ui";

const steps = [
  {
    number: "1",
    title: "Add your first property",
    description:
      "Enter the address and details for a rental in your portfolio.",
  },
  {
    number: "2",
    title: "Upload your certificates",
    description:
      "Attach Gas Safety, EICR, EPC, and every compliance document.",
  },
  {
    number: "3",
    title: "Stay automatically compliant",
    description:
      "Gentle reminders at 60, 30, and 7 days — nothing slips through.",
  },
];

export default function DashboardEmptyState() {
  return (
    <div className={`${cardClassName} overflow-hidden`}>
      <div className="relative flex items-stretch border-b border-cocoa/15">
        <div className="relative hidden h-32 w-1/3 sm:block">
          <Image
            src="/ben-elliott-8WJtlR3nlQY-unsplash.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="33vw"
          />
          <div className="absolute inset-0 bg-[#1A0A0C]/20" />
        </div>
        <div className="flex flex-1 flex-col justify-center px-8 py-12 text-center sm:px-10">
          <p className={goldLabelClassName}>Welcome</p>
          <h2 className="mt-4 font-serif text-3xl tracking-wide text-text sm:text-4xl">
            Your portfolio awaits
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-cocoa">
            You&apos;re a few minutes away from having every certificate tracked
            and every renewal handled with confidence.
          </p>
          <Link href="/properties/new" className={`${btnPrimaryClassName} mt-8`}>
            Add Your First Property
          </Link>
        </div>
        <div className="relative hidden h-32 w-1/3 sm:block">
          <Image
            src="/ben-elliott-unPC3it1yDA-unsplash.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="33vw"
          />
          <div className="absolute inset-0 bg-[#1A0A0C]/20" />
        </div>
      </div>

      <div className="grid gap-10 px-8 py-14 sm:px-12 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="text-center md:text-left">
            <p className="text-xs font-light uppercase tracking-[0.16em] text-cocoa">
              Step {step.number}
            </p>
            <h3 className="mt-3 font-serif text-lg tracking-wide text-text">
              {step.title}
            </h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-cocoa">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-cocoa/15 px-8 py-8 text-xs font-light tracking-wide text-cocoa/70">
        <span>Add property</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.25} />
        <span>Upload certificates</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.25} />
        <span>Stay compliant</span>
      </div>
    </div>
  );
}
