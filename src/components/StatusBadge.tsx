import type { ComplianceStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/compliance";

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: "sm" | "md";
}

const styles: Record<ComplianceStatus, string> = {
  green: "bg-compliant-light text-charcoal",
  amber: "bg-attention-light text-charcoal",
  red: "bg-urgent-light text-charcoal",
};

const dotClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant",
  amber: "bg-attention",
  red: "bg-urgent",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "gap-1.5 px-2 py-0.5" : "gap-2 px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-sm ${sizeClass} ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClasses[status]}`} />
      <span className="text-xs font-normal">{getStatusLabel(status)}</span>
    </span>
  );
}
