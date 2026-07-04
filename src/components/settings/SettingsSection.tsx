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
      className="scroll-mt-6 border-t border-gold/25 py-16 first:border-t-0 first:pt-0 sm:py-20"
    >
      <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
        {label}
      </p>
      <h2 className="mt-4 font-serif text-3xl tracking-wide text-text sm:text-4xl">
        {title}
      </h2>
      <div className="mt-5 h-px w-12 bg-gold/70" aria-hidden="true" />
      {description && (
        <p className="mt-6 max-w-lg text-sm font-light leading-relaxed text-leather">
          {description}
        </p>
      )}
      <div className="mt-10">{children}</div>
    </section>
  );
}
