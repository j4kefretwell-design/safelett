const accentBorder = {
  burgundy: "border-t-burgundy",
  green: "border-t-compliant",
  amber: "border-t-attention",
  red: "border-t-urgent",
};

interface SummaryCardProps {
  label: string;
  value: number;
  accent: keyof typeof accentBorder;
}

export default function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <div
      className={`rounded-sm border border-border border-t-2 bg-white px-6 py-7 shadow-[0_1px_3px_rgba(26,26,26,0.04)] ${accentBorder[accent]}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal-muted">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl font-medium tracking-tight text-charcoal">
        {value}
      </p>
    </div>
  );
}
