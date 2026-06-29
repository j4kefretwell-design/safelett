interface SummaryCardProps {
  label: string;
  value: number;
  accent?: "burgundy" | "green" | "amber" | "red";
}

export default function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div
      className="rounded-sm border border-gold-light border-t-2 border-t-gold bg-panel px-6 py-7 shadow-[0_2px_12px_rgba(92,26,46,0.06)]"
    >
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gold">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl font-medium tracking-tight text-charcoal">
        {value}
      </p>
    </div>
  );
}
