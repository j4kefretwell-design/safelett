"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ComplianceBanner from "@/components/ComplianceBanner";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import PropertyCard from "@/components/PropertyCard";
import SummaryCard from "@/components/SummaryCard";
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
    return <DashboardEmptyState />;
  }

  return (
    <>
      <ComplianceBanner stats={stats} />

      <div className="mb-14 grid gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-4">
        <SummaryCard label="Total Properties" value={stats.total} accent="total" />
        <SummaryCard label="Compliant" value={stats.compliant} accent="compliant" />
        <SummaryCard
          label="Needs Attention"
          value={stats.attention}
          accent="attention"
        />
        <SummaryCard label="Overdue" value={stats.overdue} accent="overdue" />
      </div>

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

      <div>
        <p className={goldLabelClassName}>Your Properties</p>

        {filteredProperties.length === 0 ? (
          <div className={`${cardClassName} mt-6 px-8 py-14 text-center`}>
            <p className="text-sm font-light text-cocoa">
              No properties match your search.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                status={property.status}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
