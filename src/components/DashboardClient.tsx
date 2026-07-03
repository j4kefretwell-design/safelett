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
  editorialBleedClassName,
  editorialContentClassName,
  searchInputClassName,
  sectionBandAlternateClassName,
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
    <div className="space-y-0">
      <AnimateIn>
        <DashboardHeroBanner stats={stats} />
      </AnimateIn>

      <section className="bg-dusty-cream py-16 sm:py-20">
        <div className={editorialContentClassName}>
          <ScrollRevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <SummaryCard
              label="Total Properties"
              value={stats.total}
              description="across your portfolio"
              accent="total"
            />
            <SummaryCard
              label="Compliant"
              value={stats.compliant}
              description="certificates current"
              accent="compliant"
            />
            <SummaryCard
              label="Needs Attention"
              value={stats.attention}
              description="action required"
              accent="attention"
            />
            <SummaryCard
              label="Overdue"
              value={stats.overdue}
              description="certificates expired"
              accent="overdue"
            />
          </ScrollRevealGroup>
        </div>
      </section>

      <AnimateIn delay={100}>
        <section className={`${sectionBandAlternateClassName} ${editorialBleedClassName}`}>
          <div className={`${editorialContentClassName} flex items-center justify-between gap-4 py-1`}>
            <p className={`${sectionBandLabelClassName} tracking-[0.32em]`}>
              Your Portfolio
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="shrink-0 border border-dusty-cream/25 px-4 py-2 text-[9px] font-normal uppercase tracking-[0.16em] text-dusty-cream/70 transition hover:border-dusty-cream/50 hover:text-dusty-cream disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </section>
      </AnimateIn>

      <section className="border-b border-cocoa/10 bg-dusty-cream py-10">
        <div className={editorialContentClassName}>
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
      </section>

      <section className="bg-dusty-cream py-16 sm:py-20">
        <div className={editorialContentClassName}>
          {filteredProperties.length === 0 ? (
            <AnimateIn>
              <div className={`${cardClassName} px-8 py-14 text-center`}>
                <p className="text-sm font-light italic text-cocoa">
                  No properties match your search.
                </p>
              </div>
            </AnimateIn>
          ) : (
            <ScrollRevealGroup className="grid gap-6 md:grid-cols-2 lg:gap-8">
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
