import type { ComplianceStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/compliance";

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: "sm" | "md";
}

const dotClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant",
  amber: "bg-attention",
  red: "bg-urgent",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cocoa/15 bg-beige/80 ${
        isSmall ? "px-2 py-0.5" : "px-2.5 py-1"
      }`}
      title={getStatusLabel(status)}
    >
      <span
        className={`shrink-0 rounded-full ${dotClasses[status]} ${
          isSmall ? "h-1.5 w-1.5" : "h-2 w-2"
        }`}
      />
      <span
        className={`font-light uppercase text-cocoa ${
          isSmall
            ? "text-[10px] tracking-[0.1em]"
            : "text-[11px] tracking-[0.08em]"
        }`}
      >
        {getStatusLabel(status)}
      </span>
    </span>
  );
}
