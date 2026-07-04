"use client";

import Link from "next/link";
import {
  btnOutlineClassName,
  editorialPagePaddingClassName,
} from "@/lib/ui";

export default function DashboardEmptyState() {
  return (
    <section className="bg-dusty-cream py-24 sm:py-32">
      <div
        className={`${editorialPagePaddingClassName} flex flex-col items-center text-center`}
      >
        <p className="font-serif text-3xl tracking-wide text-text sm:text-4xl lg:text-5xl">
          Your portfolio awaits.
        </p>
        <p className="mt-4 text-sm font-light text-leather">
          Add your first property to begin tracking compliance.
        </p>
        <Link href="/properties/new" className={`${btnOutlineClassName} mt-10`}>
          Add Your First Property
        </Link>
      </div>
    </section>
  );
}
