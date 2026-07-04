"use client";

import { useMemo, useState } from "react";
import { AnimateIn } from "@/components/AnimateIn";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import DashboardHeroBanner from "@/components/DashboardHeroBanner";
import PropertyCard from "@/components/PropertyCard";
import SummaryCard from "@/components/SummaryCard";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import {
  btnOutlineClassName,
  editorialBleedClassName,
  editorialPagePaddingClassName,
  searchInputClassName,
} from "@/lib/ui";
import type { ComplianceStatus, Property } from "@/lib/types";

interface PropertyWithStatus extends Property {
  status: ComplianceStatus;
}

interface DashboardClientProps {
  properties: PropertyWithStatus[];
  stats: {
    total: number;
    compliant: number;
    attention: number;
    overdue: number;
  };
}

export default function DashboardClient({
  properties,
  stats,
}: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return properties;

    return properties.filter((property) =>
      property.address.toLowerCase().includes(query)
    );
  }, [properties, search]);

  async function handleExport() {
    setExporting(true);

    try {
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error("Export failed");
      }

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

  if (properties.length === 0) {
    return (
      <AnimateIn>
        <DashboardEmptyState />
      </AnimateIn>
    );
  }

  const propertyCountLabel = `${stats.total} ${
    stats.total === 1 ? "property" : "properties"
  } under management`;

  return (
    <div className="space-y-0">
      <AnimateIn>
        <DashboardHeroBanner stats={stats} />
      </AnimateIn>

      <section
        className={`grid grid-cols-2 divide-x divide-y divide-leather/20 lg:flex lg:divide-y-0 ${editorialBleedClassName}`}
      >
        <SummaryCard label="Total Properties" value={stats.total} accent="total" />
        <SummaryCard label="Compliant" value={stats.compliant} accent="compliant" />
        <SummaryCard
          label="Needs Attention"
          value={stats.attention}
          accent="attention"
        />
        <SummaryCard label="Overdue" value={stats.overdue} accent="overdue" />
      </section>

      <section
        className={`bg-espresso px-8 py-14 text-center sm:px-12 sm:py-16 lg:px-16 ${editorialBleedClassName}`}
      >
        <p className="font-serif text-xl italic tracking-wide text-dusty-cream/85 sm:text-2xl">
          Every deadline met. Every property protected.
        </p>
      </section>

      <section className={`bg-dusty-cream py-16 sm:py-20 ${editorialBleedClassName}`}>
        <div
          className={`${editorialPagePaddingClassName} grid items-end gap-12 lg:grid-cols-2 lg:gap-16`}
        >
          <div>
            <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
              Portfolio
            </p>
            <h2 className="mt-4 font-serif text-4xl tracking-wide text-text sm:text-5xl">
              Your Portfolio
            </h2>
            <div className="mt-5 h-px w-12 bg-gold/70" aria-hidden="true" />
            <p className="mt-5 text-sm font-light text-leather">
              {propertyCountLabel}
            </p>
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
            <AnimateIn>
              <div className="border border-leather/20 bg-sand px-8 py-14 text-center">
                <p className="text-sm font-light italic text-leather">
                  No properties match your search.
                </p>
              </div>
            </AnimateIn>
          ) : (
            <ScrollRevealGroup className="grid grid-cols-2 gap-1 lg:grid-cols-3">
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
    </div>
  );
}
