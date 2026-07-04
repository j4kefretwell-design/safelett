"use client";

import Image from "next/image";
import Link from "next/link";
import { btnOutlineClassName, editorialPagePaddingClassName } from "@/lib/ui";

export default function DashboardEmptyState() {
  return (
    <div className="w-full bg-dusty-cream">
      <section className="relative h-[360px] w-full overflow-hidden sm:h-[420px]">
        <Image
          src="/ben-elliott-8WJtlR3nlQY-unsplash.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#1A0A0C]/50" />
        <div className="relative z-10 flex h-full items-center justify-center px-8 text-center">
          <p className="font-serif text-3xl tracking-wide text-dusty-cream sm:text-4xl lg:text-5xl">
            Your portfolio awaits.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div
          className={`${editorialPagePaddingClassName} flex flex-col items-center text-center`}
        >
          <p className="text-sm font-light text-leather">
            Add your first property to begin tracking compliance.
          </p>
          <Link href="/properties/new" className={`${btnOutlineClassName} mt-10`}>
            Add Your First Property
          </Link>
        </div>
      </section>
    </div>
  );
}
