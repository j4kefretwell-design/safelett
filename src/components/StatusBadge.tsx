import type { ComplianceStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/compliance";

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: "sm" | "md";
}

const styles: Record<ComplianceStatus, string> = {
  green: "bg-compliant-light text-compliant border-compliant/20",
  amber: "bg-attention-light text-attention border-attention/20",
  red: "bg-urgent-light text-urgent border-urgent/20",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${sizeClass} ${styles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
