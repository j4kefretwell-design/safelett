"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import { btnGoldClassName, dashboardWarmCardClassName, searchInputClassName } from "@/lib/ui";
import type { ComplianceStatus, Property } from "@/lib/types";
import { DASHBOARD_HIGHLIGHT_AFFECTED_EVENT } from "./DashboardStatusBand";

interface PropertyWithStatus extends Property {
  status: ComplianceStatus;
}

interface DashboardPortfolioProps {
  properties: PropertyWithStatus[];
}

type StatusFilter = "all" | "overdue" | "expiring" | "compliant";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Properties" },
  { key: "overdue", label: "Overdue" },
  { key: "expiring", label: "Expiring Soon" },
  { key: "compliant", label: "Compliant" },
];

function matchesStatusFilter(
  status: ComplianceStatus,
  filter: StatusFilter
): boolean {
  if (filter === "all") return true;
  if (filter === "overdue") return status === "red";
  if (filter === "expiring") return status === "amber";
  return status === "green";
}

export default function DashboardPortfolio({ properties }: DashboardPortfolioProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [highlightAffected, setHighlightAffected] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    function onHighlightEvent() {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      setHighlightAffected(true);
      timeoutId = window.setTimeout(() => setHighlightAffected(false), 2000);
    }

    window.addEventListener(DASHBOARD_HIGHLIGHT_AFFECTED_EVENT, onHighlightEvent);
    return () => {
      window.removeEventListener(DASHBOARD_HIGHLIGHT_AFFECTED_EVENT, onHighlightEvent);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      if (!matchesStatusFilter(property.status, statusFilter)) return false;
      if (!query) return true;
      return property.address.toLowerCase().includes(query);
    });
  }, [properties, search, statusFilter]);

  const emptyMessage =
    search.trim() || statusFilter !== "all"
      ? "No properties match your filters."
      : "No properties match your search.";

  return (
    <div>
      <div className="flex justify-end">
        <Link href="/properties/new" className={btnGoldClassName}>
          Add Property →
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <input
          id="property-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by address..."
          aria-label="Search properties"
          className={`${searchInputClassName} w-full max-w-md`}
        />

        <div
          className="flex flex-wrap gap-x-5 gap-y-2"
          role="group"
          aria-label="Filter properties by status"
        >
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                aria-pressed={isActive}
                className={`pb-0.5 text-[10px] font-normal uppercase tracking-[0.16em] transition ${
                  isActive
                    ? "border-b border-gold text-leather"
                    : "text-leather/55 hover:text-leather"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id="property-grid" className="mt-12 scroll-mt-24">
        {filteredProperties.length === 0 ? (
          <div className={`${dashboardWarmCardClassName} px-8 py-14 text-center`}>
            <p className="dashboard-warm-card-content text-sm font-light italic text-leather">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <ScrollRevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                status={property.status}
                highlightPulse={
                  highlightAffected &&
                  (property.status === "amber" || property.status === "red")
                }
              />
            ))}
          </ScrollRevealGroup>
        )}
      </div>
    </div>
  );
}
