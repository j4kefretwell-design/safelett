"use client";

interface SummaryCardProps {
  label: string;
  value: number;
  accent?: "total" | "compliant" | "attention" | "overdue";
}

const accentTopBorderClasses = {
  total: "border-t-gold",
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
    <div
      className={`flex min-w-0 flex-1 flex-col items-center justify-center border-t-[3px] bg-sand px-4 py-12 sm:px-6 sm:py-14 lg:flex-1 ${accentTopBorderClasses[accent]}`}
    >
      <p className="font-serif text-5xl tracking-wide text-text sm:text-6xl lg:text-7xl">
        {value}
      </p>
      <p className="mt-5 text-center text-[10px] font-normal uppercase tracking-[0.24em] text-leather">
        {label}
      </p>
    </div>
  );
}
