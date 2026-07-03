"use client";

import { goldLabelClassName, statCardClassName } from "@/lib/ui";

interface SummaryCardProps {
  label: string;
  value: number;
  accent?: "total" | "compliant" | "attention" | "overdue";
}

const topBorderClasses = {
  total: "border-t-gold/70",
  compliant: "border-t-compliant",
  attention: "border-t-attention",
  overdue: "border-t-urgent",
};

export default function SummaryCard({
  label,
  value,
  accent = "total",
}: SummaryCardProps) {
  return (
    <div className={`${statCardClassName} ${topBorderClasses[accent]}`}>
      <p className="font-serif text-5xl tracking-wide text-text sm:text-6xl">
        {value}
      </p>
      <p className={`${goldLabelClassName} mt-4`}>{label}</p>
    </div>
  );
}
