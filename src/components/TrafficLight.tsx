import type { ComplianceStatus } from "@/lib/types";

interface TrafficLightProps {
  status: ComplianceStatus;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const colorClasses: Record<ComplianceStatus, string> = {
  green: "bg-green-500",
  amber: "bg-amber-400",
  red: "bg-red-500",
};

export default function TrafficLight({ status, size = "md" }: TrafficLightProps) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${sizeClasses[size]} ${colorClasses[status]}`}
      title={status}
      aria-label={`Status: ${status}`}
    />
  );
}
