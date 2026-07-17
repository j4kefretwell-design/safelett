"use client";

import { type ReactNode } from "react";

interface SettingsSectionProps {
  id: string;
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function SettingsSection({
  id,
  label,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-20 border-t border-gold/40 py-14 first:border-t-0 first:pt-0 sm:py-16"
    >
      <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
        {label}
      </p>
      <h2 className="mt-3 font-serif text-2xl tracking-wide text-heading sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-leather">
          {description}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}
