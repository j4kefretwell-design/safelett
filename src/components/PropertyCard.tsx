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
      className={`group block border-l-[3px] bg-beige p-8 transition duration-300 hover:bg-beige/80 hover:shadow-[0_8px_24px_rgba(26,16,8,0.08)] sm:p-10 ${statusBorderClasses[status]}`}
    >
      <h3 className="font-serif text-xl leading-snug tracking-wide text-text transition group-hover:text-raspberry sm:text-2xl">
        {property.address}
      </h3>
      <p className="mt-5 text-[10px] font-normal uppercase tracking-[0.18em] text-cocoa">
        {PROPERTY_TYPE_LABELS[property.property_type]} · {property.bedrooms}{" "}
        {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
      </p>
      <p
        className={`mt-3 text-[10px] font-normal uppercase tracking-[0.16em] ${statusTextClasses[status]}`}
      >
        {getStatusLabel(status)}
      </p>
    </Link>
  );
}
