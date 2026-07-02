import { goldLabelClassName, statCardClassName } from "@/lib/ui";

interface SummaryCardProps {
  label: string;
  value: number;
  accent?: "total" | "compliant" | "attention" | "overdue";
}

const topBorderClasses = {
  total: "border-t-cocoa",
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
      <p className={goldLabelClassName}>{label}</p>
      <p className="mt-5 font-serif text-5xl tracking-wide text-text">{value}</p>
    </div>
  );
}
