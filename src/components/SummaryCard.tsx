import { goldLabelClassName, plaqueClassName } from "@/lib/ui";

interface SummaryCardProps {
  label: string;
  value: number;
  accent?: "burgundy" | "green" | "amber" | "red";
}

export default function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className={plaqueClassName}>
      <p className={goldLabelClassName}>{label}</p>
      <p className="relative mt-4 font-serif text-4xl font-medium tracking-tight text-charcoal">
        {value}
      </p>
    </div>
  );
}
