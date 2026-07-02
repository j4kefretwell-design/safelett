import { STAT_ICONS } from "@/lib/icons";
import { goldLabelClassName, plaqueClassName } from "@/lib/ui";

interface SummaryCardProps {
  label: string;
  value: number;
  accent?: "total" | "compliant" | "attention" | "overdue";
}

const accentColors = {
  total: "text-raspberry",
  compliant: "text-compliant",
  attention: "text-attention",
  overdue: "text-urgent",
};

export default function SummaryCard({
  label,
  value,
  accent = "total",
}: SummaryCardProps) {
  const Icon = STAT_ICONS[accent];

  return (
    <div className={plaqueClassName}>
      <div className="relative flex items-start justify-between gap-3">
        <p className={goldLabelClassName}>{label}</p>
        <Icon
          className={`h-4 w-4 shrink-0 ${accentColors[accent]}`}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <p className="relative mt-4 font-serif text-4xl tracking-wide text-text">
        {value}
      </p>
    </div>
  );
}
