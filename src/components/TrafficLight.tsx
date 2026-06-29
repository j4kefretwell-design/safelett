import type { ComplianceStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/compliance";

interface TrafficLightProps {
  status: ComplianceStatus;
  size?: "sm" | "md" | "lg";
}

const containerSizes = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-8 w-8",
};

const dotSizes = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2 w-2",
};

const dotClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant",
  amber: "bg-attention",
  red: "bg-urgent",
};

export default function TrafficLight({ status, size = "md" }: TrafficLightProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-gold-light/40 bg-gradient-to-b from-panel to-cream/30 shadow-[inset_0_1px_2px_rgba(92,26,46,0.08)] ${containerSizes[size]}`}
      title={getStatusLabel(status)}
      aria-label={`Status: ${getStatusLabel(status)}`}
    >
      <span className={`rounded-full ${dotSizes[size]} ${dotClasses[status]}`} />
    </span>
  );
}
