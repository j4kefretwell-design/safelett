"use client";

import Link from "next/link";
import { getStatusLabel } from "@/lib/compliance";
import {
  PROPERTY_TYPE_LABELS,
  type ComplianceStatus,
  type Property,
} from "@/lib/types";

interface PropertyCardProps {
  property: Property;
  status: ComplianceStatus;
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

export default function PropertyCard({ property, status }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={`group flex min-h-[260px] flex-col justify-between border border-leather/20 border-l-[3px] bg-sand p-8 transition duration-300 hover:border-tan sm:min-h-[280px] sm:p-10 ${statusBorderClasses[status]}`}
    >
      <div>
        <h3 className="font-serif text-xl leading-snug tracking-wide text-text transition group-hover:text-raspberry sm:text-2xl">
          {property.address}
        </h3>
        <p className="mt-5 text-[10px] font-normal uppercase tracking-[0.18em] text-leather">
          {PROPERTY_TYPE_LABELS[property.property_type]} · {property.bedrooms}{" "}
          {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
        </p>
      </div>
      <p
        className={`text-[10px] font-normal uppercase tracking-[0.16em] ${statusTextClasses[status]}`}
      >
        {getStatusLabel(status)}
      </p>
    </Link>
  );
}
