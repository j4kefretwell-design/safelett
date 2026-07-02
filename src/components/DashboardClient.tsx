"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimateIn } from "@/components/AnimateIn";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import DashboardHeroBanner from "@/components/DashboardHeroBanner";
import PropertyCard from "@/components/PropertyCard";
import SummaryCard from "@/components/SummaryCard";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import {
  btnGoldClassName,
  cardClassName,
  goldLabelClassName,
  inputClassName,
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

      <ScrollRevealGroup className="mb-14 grid gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-4">
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
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 sm:max-w-md">
            <label htmlFor="property-search" className={goldLabelClassName}>
              Search
            </label>
            <input
              id="property-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address..."
              className={`${inputClassName} mt-2`}
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className={btnGoldClassName}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </AnimateIn>

      <div>
        <AnimateIn delay={150}>
          <div className="relative -mx-6 mb-8 flex items-stretch overflow-hidden border border-cocoa/15 sm:-mx-10 lg:-mx-14">
            <div className="flex flex-1 flex-col justify-center px-8 py-7 sm:px-10 lg:px-14">
              <p className={goldLabelClassName}>Your Portfolio</p>
              <p className="mt-2 font-serif text-xl tracking-wide text-text sm:text-2xl">
                {properties.length}{" "}
                {properties.length === 1 ? "property" : "properties"} under management
              </p>
            </div>
            <div className="hidden shrink-0 sm:flex">
              <div className="relative h-full w-28 border-l border-cocoa/15">
                <Image
                  src="/ben-elliott-8WJtlR3nlQY-unsplash.jpg"
                  alt=""
                  fill
                  className="object-cover opacity-90"
                  sizes="112px"
                />
              </div>
              <div className="relative h-full w-28 border-l border-cocoa/15">
                <Image
                  src="/ben-elliott-unPC3it1yDA-unsplash.jpg"
                  alt=""
                  fill
                  className="object-cover opacity-90"
                  sizes="112px"
                />
              </div>
            </div>
          </div>
        </AnimateIn>

        {filteredProperties.length === 0 ? (
          <AnimateIn>
            <div className={`${cardClassName} px-8 py-14 text-center`}>
              <p className="text-sm font-light text-cocoa">
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
