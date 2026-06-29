import type { ComplianceStatus } from "@/lib/types";

interface TrafficLightProps {
  status: ComplianceStatus;
  size?: "sm" | "md" | "lg";
}

const dotSizes = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

const tintClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant-light",
  amber: "bg-attention-light",
  red: "bg-urgent-light",
};

const dotClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant",
  amber: "bg-attention",
  red: "bg-urgent",
};

export default function TrafficLight({ status, size = "md" }: TrafficLightProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full p-1.5 ${tintClasses[status]}`}
      title={status}
      aria-label={`Status: ${status}`}
    >
      <span className={`rounded-full ${dotSizes[size]} ${dotClasses[status]}`} />
    </span>
  );
}
