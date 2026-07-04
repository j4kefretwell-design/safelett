"use client";

import Link from "next/link";
import { getStatusLabel } from "@/lib/compliance";
import { dashboardWarmCardClassName } from "@/lib/ui";
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

const statusBorderClasses: Record<ComplianceStatus, string> = {
  green: "border-l-compliant",
  amber: "border-l-attention",
  red: "border-l-urgent",
};

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
      className={`group ${dashboardWarmCardClassName} flex min-h-[220px] flex-col justify-between border-l-[3px] p-8 transition duration-200 hover:border-leather sm:min-h-[240px] ${statusBorderClasses[status]} ${highlightPulse ? "property-card-highlight-pulse" : ""}`}
    >
      <div className="dashboard-warm-card-content">
        <h3 className="font-serif text-xl leading-snug tracking-wide text-text transition group-hover:text-raspberry sm:text-2xl">
          {property.address}
        </h3>
        <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
          {PROPERTY_TYPE_LABELS[property.property_type]} · {property.bedrooms}{" "}
          {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
        </p>
      </div>
      <p
        className={`dashboard-warm-card-content text-[10px] font-normal uppercase tracking-[0.14em] ${statusTextClasses[status]}`}
      >
        {getStatusLabel(status)}
      </p>
    </Link>
  );
}
