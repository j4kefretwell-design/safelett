"use client";

import { useMemo, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import {
  btnOutlineClassName,
  editorialPagePaddingClassName,
  searchInputClassName,
} from "@/lib/ui";
import type { ComplianceStatus, Property } from "@/lib/types";

interface PropertyWithStatus extends Property {
  status: ComplianceStatus;
}

interface DashboardPortfolioProps {
  properties: PropertyWithStatus[];
  totalCount: number;
}

export default function DashboardPortfolio({
  properties,
  totalCount,
}: DashboardPortfolioProps) {
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return properties;
    return properties.filter((p) => p.address.toLowerCase().includes(query));
  }, [properties, search]);

  const propertyCountLabel = `${totalCount} ${
    totalCount === 1 ? "property" : "properties"
  } under management`;

  async function handleExport() {
    setExporting(true);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fretwell-co-compliance-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      window.alert("Unable to export compliance report. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="w-full bg-dusty-cream py-16 sm:py-20">
      <div
        className={`${editorialPagePaddingClassName} grid items-end gap-12 lg:grid-cols-2 lg:gap-16`}
      >
        <div>
          <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
            Portfolio
          </p>
          <h2 className="mt-4 font-serif text-4xl uppercase tracking-wide text-text sm:text-5xl">
            Your Portfolio
          </h2>
          <div className="mt-5 h-px w-12 bg-gold/70" aria-hidden="true" />
          <p className="mt-5 text-sm font-light text-leather">{propertyCountLabel}</p>
        </div>

        <div className="flex flex-col items-stretch gap-6 sm:items-end lg:ml-auto lg:max-w-md">
          <input
            id="property-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address..."
            aria-label="Search properties"
            className={searchInputClassName}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className={`${btnOutlineClassName} w-full sm:w-auto`}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className={`${editorialPagePaddingClassName} mt-14 sm:mt-16`}>
        {filteredProperties.length === 0 ? (
          <div className="border border-leather/20 bg-sand px-8 py-14 text-center">
            <p className="text-sm font-light italic text-leather">
              No properties match your search.
            </p>
          </div>
        ) : (
          <ScrollRevealGroup className="grid grid-cols-2 gap-1 md:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
