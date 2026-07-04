"use client";

import Link from "next/link";
import BrandMonogram from "@/components/BrandMonogram";
import {
  btnOutlineClassName,
  editorialBleedClassName,
  editorialPagePaddingClassName,
} from "@/lib/ui";

export default function DashboardEmptyState() {
  return (
    <section className={`bg-dusty-cream py-24 sm:py-32 ${editorialBleedClassName}`}>
      <div
        className={`${editorialPagePaddingClassName} relative flex flex-col items-center text-center`}
      >
        <div className="opacity-30" aria-hidden="true">
          <BrandMonogram href={null} />
        </div>

        <p className="mt-16 font-serif text-3xl tracking-wide text-text sm:text-4xl lg:text-5xl">
          Your portfolio awaits.
        </p>

        <Link
          href="/properties/new"
          className={`${btnOutlineClassName} mt-12`}
        >
          Add Your First Property
        </Link>
      </div>
    </section>
  );
}
