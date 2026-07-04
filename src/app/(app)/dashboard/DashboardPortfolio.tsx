"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import { btnGoldClassName, searchInputClassName } from "@/lib/ui";
import type { ComplianceStatus, Property } from "@/lib/types";

interface PropertyWithStatus extends Property {
  status: ComplianceStatus;
}

interface DashboardPortfolioProps {
  properties: PropertyWithStatus[];
}

export default function DashboardPortfolio({ properties }: DashboardPortfolioProps) {
  const [search, setSearch] = useState("");

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return properties;
    return properties.filter((p) => p.address.toLowerCase().includes(query));
  }, [properties, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
          Your Portfolio
        </p>
        <Link href="/properties/new" className={btnGoldClassName}>
          Add Property →
        </Link>
      </div>

      <input
        id="property-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by address..."
        aria-label="Search properties"
        className={`${searchInputClassName} mt-10 max-w-md`}
      />

      <div className="mt-12">
        {filteredProperties.length === 0 ? (
          <div className="border border-leather/25 bg-white px-8 py-14 text-center">
            <p className="text-sm font-light italic text-leather">
              No properties match your search.
            </p>
          </div>
        ) : (
          <ScrollRevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                status={property.status}
              />
            ))}
          </ScrollRevealGroup>
        )}
      </div>
    </div>
  );
}
