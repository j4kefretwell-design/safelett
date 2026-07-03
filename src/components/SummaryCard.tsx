"use client";

interface SummaryCardProps {
  label: string;
  value: number;
  description: string;
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
  description,
  accent = "total",
}: SummaryCardProps) {
  return (
    <div className="border border-leather/40 bg-sand px-6 py-8 text-center transition duration-300 hover:border-tan sm:px-8 sm:py-10">
      <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-leather">
        {label}
      </p>
      <div
        className={`mx-auto mt-4 h-px w-10 ${accentLineClasses[accent]}`}
        aria-hidden="true"
      />
      <p className="mt-6 font-serif text-5xl tracking-wide text-text sm:text-6xl">
        {value}
      </p>
      <p className="mt-5 text-xs font-light italic text-tan">{description}</p>
    </div>
  );
}
