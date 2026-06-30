import Link from "next/link";
import { Building2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import TrafficLight from "@/components/TrafficLight";
import { cardClassName } from "@/lib/ui";
import {
  PROPERTY_TYPE_LABELS,
  type ComplianceStatus,
  type Property,
} from "@/lib/types";

interface PropertyCardProps {
  property: Property;
  status: ComplianceStatus;
}

export default function PropertyCard({ property, status }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={`${cardClassName} property-card group relative block overflow-hidden p-7 sm:p-8`}
    >
      <div className="property-card-texture pointer-events-none absolute inset-0 opacity-70" />

      <Building2
        className="absolute top-5 right-5 h-4 w-4 text-gold/35 transition group-hover:text-gold/55"
        strokeWidth={1.5}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <TrafficLight status={status} size="md" />
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg font-medium tracking-tight text-charcoal transition group-hover:text-burgundy">
              {property.address}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
              {PROPERTY_TYPE_LABELS[property.property_type]} · {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
            </p>
          </div>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
    </Link>
  );
}
