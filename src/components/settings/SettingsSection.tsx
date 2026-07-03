"use client";

import { type ReactNode } from "react";
import { editorialBleedClassName } from "@/lib/ui";

interface SettingsSectionProps {
  title: string;
  description?: string;
  bandTone?: "burgundy" | "espresso";
  children: ReactNode;
}

export default function SettingsSection({
  title,
  description,
  bandTone = "burgundy",
  children,
}: SettingsSectionProps) {
  const bandClass =
    bandTone === "espresso" ? "bg-espresso" : "bg-raspberry";

  return (
    <section>
      <div
        className={`${bandClass} px-8 py-4 sm:px-12 lg:px-16 ${editorialBleedClassName}`}
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-dusty-cream/80">
          {title}
        </p>
      </div>

      <div className="bg-dusty-cream px-8 py-12 sm:px-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-xl">
          {description && (
            <p className="mb-10 max-w-lg text-sm font-light leading-relaxed text-leather">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
