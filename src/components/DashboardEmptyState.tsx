import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import { btnOutlineClassName } from "@/lib/ui";

export default function DashboardEmptyState() {
  return (
    <div className="relative flex min-h-[420px] flex-col items-center justify-center border border-cocoa/15 bg-beige px-8 py-24 text-center sm:px-16">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]"
        aria-hidden="true"
      >
        <BrandWordmark href={null} variant="hero" />
      </div>

      <p className="relative font-serif text-3xl tracking-wide text-text sm:text-4xl">
        Your portfolio awaits.
      </p>

      <Link
        href="/properties/new"
        className={`${btnOutlineClassName} relative mt-10`}
      >
        Add Your First Property
      </Link>
    </div>
  );
}
