import type { ComplianceStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/compliance";

interface StatusDotProps {
  status: ComplianceStatus;
  className?: string;
  showLabel?: boolean;
}

const dotClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant",
  amber: "bg-attention",
  red: "bg-urgent",
};

export default function StatusDot({
  status,
  className = "",
  showLabel = false,
}: StatusDotProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      title={getStatusLabel(status)}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${dotClasses[status]}`}
        aria-hidden
      />
      {showLabel && (
        <span className="text-xs font-light tracking-wide text-cocoa">
          {getStatusLabel(status)}
        </span>
      )}
    </span>
  );
}
