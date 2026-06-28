const accentBorder = {
  forest: "border-l-forest-900",
  green: "border-l-compliant",
  amber: "border-l-attention",
  red: "border-l-urgent",
  gold: "border-l-gold",
};

const accentValue = {
  forest: "text-forest-900",
  green: "text-compliant",
  amber: "text-attention",
  red: "text-urgent",
  gold: "text-gold",
};

interface SummaryCardProps {
  label: string;
  value: number;
  accent: keyof typeof accentBorder;
}

export default function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <div
      className={`rounded-xl border border-gold-muted/60 border-l-4 bg-ivory p-6 shadow-sm ${accentBorder[accent]}`}
    >
      <p className="text-sm font-medium text-mahogany-900/60">{label}</p>
      <p
        className={`mt-2 font-serif text-3xl font-semibold tracking-tight ${accentValue[accent]}`}
      >
        {value}
      </p>
    </div>
  );
}
