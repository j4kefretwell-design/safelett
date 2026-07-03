"use client";

import { useMemo, useState } from "react";
import { AnimateIn } from "@/components/AnimateIn";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import DashboardHeroBanner from "@/components/DashboardHeroBanner";
import PropertyCard from "@/components/PropertyCard";
import SummaryCard from "@/components/SummaryCard";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import {
  cardClassName,
  searchInputClassName,
  sectionBandClassName,
  sectionBandLabelClassName,
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

  return (
    <>
      <AnimateIn>
        <DashboardHeroBanner stats={stats} />
      </AnimateIn>

      <ScrollRevealGroup className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Properties" value={stats.total} accent="total" />
        <SummaryCard label="Compliant" value={stats.compliant} accent="compliant" />
        <SummaryCard
          label="Needs Attention"
          value={stats.attention}
          accent="attention"
        />
        <SummaryCard label="Overdue" value={stats.overdue} accent="overdue" />
      </ScrollRevealGroup>

      <AnimateIn delay={100}>
        <div className="-mx-6 sm:-mx-10 lg:-mx-14">
          <div className={`${sectionBandClassName} flex items-center justify-between gap-4`}>
            <p className={sectionBandLabelClassName}>Your Portfolio</p>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="shrink-0 border border-dusty-cream/30 px-4 py-2 text-[10px] font-normal uppercase tracking-[0.14em] text-dusty-cream/80 transition hover:border-dusty-cream/60 hover:text-dusty-cream disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          <div className="border-x border-b border-cocoa/15 bg-dusty-cream px-6 py-8 sm:px-10 lg:px-14">
            <input
              id="property-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address..."
              aria-label="Search properties"
              className={`${searchInputClassName} max-w-md`}
            />
          </div>
        </div>
      </AnimateIn>

      <div className="mt-10">
        {filteredProperties.length === 0 ? (
          <AnimateIn>
            <div className={`${cardClassName} px-8 py-14 text-center`}>
              <p className="text-sm font-light italic text-cocoa">
                No properties match your search.
              </p>
            </div>
          </AnimateIn>
        ) : (
          <ScrollRevealGroup className="grid gap-6 md:grid-cols-2">
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
    </>
  );
}
