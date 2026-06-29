"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import SummaryCard from "@/components/SummaryCard";
import {
  btnGoldClassName,
  btnPrimaryClassName,
  cardClassName,
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
      link.download = `safelett-compliance-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      window.alert("Unable to export compliance report. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Properties" value={stats.total} accent="burgundy" />
        <SummaryCard label="Compliant" value={stats.compliant} accent="green" />
        <SummaryCard
          label="Needs Attention"
          value={stats.attention}
          accent="amber"
        />
        <SummaryCard label="Overdue" value={stats.overdue} accent="red" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <label htmlFor="property-search" className="sr-only">
            Search properties
          </label>
          <input
            id="property-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property address..."
            className={inputClassName}
          />
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || properties.length === 0}
          className={btnGoldClassName}
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div>
        <h2 className="mb-5 font-serif text-xl font-medium text-charcoal">
          Your Properties
        </h2>

        {properties.length === 0 ? (
          <div
            className={`${cardClassName} flex flex-col items-center px-8 py-20 text-center`}
          >
            <p className="font-serif text-xl font-medium text-charcoal">
              No properties yet
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-muted">
              Add your first property to start tracking compliance certificates
              across your portfolio.
            </p>
            <Link href="/properties/new" className={`${btnPrimaryClassName} mt-6`}>
              Add Property
            </Link>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className={`${cardClassName} px-8 py-14 text-center`}>
            <p className="text-sm text-charcoal-muted">
              No properties match your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
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
