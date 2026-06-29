import Link from "next/link";
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
      className={`${cardClassName} group block p-6 transition hover:border-charcoal/15 hover:shadow-[0_2px_8px_rgba(26,26,26,0.06)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <TrafficLight status={status} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg font-medium text-charcoal group-hover:text-burgundy">
              {property.address}
            </h3>
            <p className="mt-1.5 text-sm text-charcoal-muted">
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
