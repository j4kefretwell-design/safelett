import type { ComplianceStatus } from "@/lib/types";

interface TrafficLightProps {
  status: ComplianceStatus;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-2.5 w-2.5",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const colorClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant shadow-[0_0_0_3px_rgba(45,92,74,0.15)]",
  amber: "bg-attention shadow-[0_0_0_3px_rgba(154,107,47,0.15)]",
  red: "bg-urgent shadow-[0_0_0_3px_rgba(139,46,46,0.15)]",
};

export default function TrafficLight({ status, size = "md" }: TrafficLightProps) {
  return (
    <span
      className={`mt-1 inline-block shrink-0 rounded-full ${sizeClasses[size]} ${colorClasses[status]}`}
      title={status}
      aria-label={`Status: ${status}`}
    />
  );
}
