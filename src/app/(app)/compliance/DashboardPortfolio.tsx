"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStatusLabel } from "@/lib/compliance";
import { btnGoldClassName, searchInputClassName } from "@/lib/ui";
import {
  PROPERTY_TYPE_LABELS,
  type ComplianceStatus,
  type Property,
} from "@/lib/types";
import { DASHBOARD_HIGHLIGHT_AFFECTED_EVENT } from "./DashboardStatusBand";

interface PropertyWithStatus extends Property {
  status: ComplianceStatus;
  nextExpiry: string | null;
}

const STATUS_DOT_COLORS: Record<ComplianceStatus, string> = {
  green: "#4A6B55",
  amber: "#8B7355",
  red: "#7A4048",
};

function formatExpiryDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface DashboardPortfolioProps {
  properties: PropertyWithStatus[];
}

type StatusFilter = "all" | "overdue" | "expiring" | "attention" | "compliant";

const STATUS_FILTERS: { key: Exclude<StatusFilter, "attention">; label: string }[] = [
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
  if (filter === "attention") return status === "red" || status === "amber";
  return status === "green";
}

function parseFilterParam(value: string | null): StatusFilter {
  if (
    value === "overdue" ||
    value === "expiring" ||
    value === "attention" ||
    value === "compliant"
  ) {
    return value;
  }
  return "all";
}

export default function DashboardPortfolio({ properties }: DashboardPortfolioProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() =>
    parseFilterParam(searchParams.get("filter"))
  );
  const [highlightAffected, setHighlightAffected] = useState(false);

  useEffect(() => {
    setStatusFilter(parseFilterParam(searchParams.get("filter")));
  }, [searchParams]);

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
    <div className="min-w-0">
      <div className="flex justify-stretch sm:justify-end">
        <Link href="/properties/new" className={`${btnGoldClassName} w-full sm:w-auto`}>
          Add Property →
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <input
          id="property-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by address..."
          aria-label="Search properties"
          className={`${searchInputClassName} w-full lg:max-w-md`}
        />

        <div
          className="flex flex-wrap gap-1 px-2 py-2"
          role="group"
          aria-label="Filter properties by status"
          style={{ backgroundColor: "#33181C" }}
        >
          {STATUS_FILTERS.map((filter) => {
            const isActive =
              statusFilter === filter.key ||
              (statusFilter === "attention" &&
                (filter.key === "overdue" || filter.key === "expiring"));
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                aria-pressed={statusFilter === filter.key}
                className="min-h-11 px-4 text-[11px] font-normal uppercase tracking-[0.14em] transition"
                style={
                  isActive
                    ? {
                        backgroundColor: "#F8F4EE",
                        color: "#33181C",
                        borderBottom: "2px solid #C4A35A",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "rgba(234,230,223,0.7)",
                        borderBottom: "2px solid transparent",
                      }
                }
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {statusFilter === "attention" ? (
        <p className="mt-4 text-sm font-light text-leather">
          Showing properties that need attention.
        </p>
      ) : null}

      <div id="property-grid" className="mt-10 scroll-mt-24 sm:mt-12">
        {filteredProperties.length === 0 ? (
          <p
            className="py-14 text-center text-base font-light italic leading-relaxed"
            style={{ color: "#60544D" }}
          >
            {emptyMessage}
          </p>
        ) : (
          <div style={{ borderTop: "1px solid rgba(196,163,90,0.35)" }}>
            {filteredProperties.map((property) => {
              const pulse =
                highlightAffected &&
                (property.status === "amber" || property.status === "red");
              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className={`group flex flex-col gap-3 py-6 transition sm:flex-row sm:items-center sm:justify-between sm:gap-8 ${pulse ? "property-card-highlight-pulse" : ""}`}
                  style={{ borderBottom: "1px solid rgba(196,163,90,0.35)" }}
                >
                  <div className="min-w-0">
                    <h3
                      className="truncate font-serif text-lg font-normal tracking-wide transition group-hover:opacity-70 sm:text-xl"
                      style={{ color: "#60544D" }}
                    >
                      {property.address}
                    </h3>
                    <p
                      className="mt-1 text-xs font-light"
                      style={{ color: "rgba(96,84,77,0.65)" }}
                    >
                      {PROPERTY_TYPE_LABELS[property.property_type]} ·{" "}
                      {property.bedrooms}{" "}
                      {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: STATUS_DOT_COLORS[property.status],
                      }}
                      aria-hidden="true"
                    />
                    <p
                      className="text-[11px] font-normal uppercase tracking-[0.14em]"
                      style={{ color: "#60544D" }}
                    >
                      {getStatusLabel(property.status)}
                      {property.nextExpiry
                        ? ` · Next expiry ${formatExpiryDate(property.nextExpiry)}`
                        : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
