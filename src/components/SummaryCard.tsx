interface SummaryCardProps {
  label: string;
  value: number;
  accent: "navy" | "green" | "amber" | "red";
}

const accentBorder = {
  navy: "border-l-navy-900",
  green: "border-l-compliant",
  amber: "border-l-attention",
  red: "border-l-urgent",
};

const accentValue = {
  navy: "text-navy-900",
  green: "text-compliant",
  amber: "text-attention",
  red: "text-urgent",
};

export default function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200/80 border-l-4 bg-white p-6 shadow-sm ${accentBorder[accent]}`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-2 text-3xl font-bold tracking-tight ${accentValue[accent]}`}
      >
        {value}
      </p>
    </div>
  );
}
