"use client";

import Link from "next/link";
import { getStatusLabel } from "@/lib/compliance";
import { capsLabelClassName, dashboardWarmCardClassName } from "@/lib/ui";
import {
  PROPERTY_TYPE_LABELS,
  type ComplianceStatus,
  type Property,
} from "@/lib/types";

interface PropertyCardProps {
  property: Property;
  status: ComplianceStatus;
  highlightPulse?: boolean;
}

const statusTextClasses: Record<ComplianceStatus, string> = {
  green: "text-compliant",
  amber: "text-attention",
  red: "text-urgent",
};

export default function PropertyCard({
  property,
  status,
  highlightPulse = false,
}: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={`group ${dashboardWarmCardClassName} flex min-h-[200px] flex-col justify-between border-l-[3px] border-l-espresso p-6 transition duration-200 hover:border-leather sm:min-h-[240px] sm:p-8 ${highlightPulse ? "property-card-highlight-pulse" : ""}`}
    >
      <div className="dashboard-warm-card-content">
        <h3 className="font-serif text-lg leading-snug tracking-wide text-text transition group-hover:text-raspberry sm:text-xl lg:text-2xl">
          {property.address}
        </h3>
        <p className={`mt-4 ${capsLabelClassName}`}>
          {PROPERTY_TYPE_LABELS[property.property_type]} · {property.bedrooms}{" "}
          {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
        </p>
      </div>
      <p
        className={`dashboard-warm-card-content ${capsLabelClassName} ${statusTextClasses[status]}`}
      >
        {getStatusLabel(status)}
      </p>
    </Link>
  );
}
