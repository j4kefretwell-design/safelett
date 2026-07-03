"use client";

import { goldLabelClassName } from "@/lib/ui";

interface SummaryCardProps {
  label: string;
  value: number;
  accent?: "total" | "compliant" | "attention" | "overdue";
}

const accentLineClasses = {
  total: "bg-gold/70",
  compliant: "bg-compliant",
  attention: "bg-attention",
  overdue: "bg-urgent",
};

export default function SummaryCard({
  label,
  value,
  accent = "total",
}: SummaryCardProps) {
  return (
    <div className="px-2 py-4 sm:px-4">
      <div
        className={`mb-6 h-px w-12 ${accentLineClasses[accent]}`}
        aria-hidden="true"
      />
      <p className="font-serif text-5xl tracking-wide text-text sm:text-6xl lg:text-7xl">
        {value}
      </p>
      <p className={`${goldLabelClassName} mt-5 text-[10px] tracking-[0.24em]`}>
        {label}
      </p>
    </div>
  );
}
