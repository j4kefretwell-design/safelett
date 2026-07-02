import Link from "next/link";
import StatusDot from "@/components/StatusDot";
import { propertyCardClassName } from "@/lib/ui";
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
      className={propertyCardClassName}
    >
      <div className="min-w-0 pr-8">
        <h3 className="font-serif text-lg tracking-wide text-text transition group-hover:text-raspberry">
          {property.address}
        </h3>
        <p className="mt-3 text-sm font-light text-cocoa">
          {PROPERTY_TYPE_LABELS[property.property_type]} · {property.bedrooms}{" "}
          {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
        </p>
      </div>
      <div className="absolute bottom-6 right-6 sm:bottom-7 sm:right-7">
        <StatusDot status={status} />
      </div>
    </Link>
  );
}
