import type { ComplianceStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: "sm" | "md";
}

const styles: Record<ComplianceStatus, string> = {
  green: "bg-compliant-light text-compliant border-emerald-200",
  amber: "bg-attention-light text-attention border-amber-200",
  red: "bg-urgent-light text-urgent border-red-200",
};

const labels: Record<ComplianceStatus, string> = {
  green: "Compliant",
  amber: "Needs Attention",
  red: "Overdue",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-xs"
      : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${sizeClass} ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function getStatusBadgeLabel(status: ComplianceStatus): string {
  return labels[status];
}
