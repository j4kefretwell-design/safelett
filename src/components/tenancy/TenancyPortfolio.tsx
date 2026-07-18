"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TenancyCard from "@/components/tenancy/TenancyCard";
import {
  getTenancyStatus,
  isDepositProtectionOverdue,
  type Tenancy,
  type TenancyStatus,
} from "@/lib/tenancy";
import { searchInputClassName } from "@/lib/ui";

interface TenancyPortfolioProps {
  tenancies: Tenancy[];
}

type StatusFilter = "all" | "active" | "renewal_due" | "expired" | "urgent";

function parseFilterParam(value: string | null): StatusFilter {
  if (
    value === "active" ||
    value === "renewal_due" ||
    value === "expired" ||
    value === "urgent"
  ) {
    return value;
  }
  return "all";
}

function matchesStatusFilter(
  status: TenancyStatus,
  filter: StatusFilter
): boolean {
  if (filter === "all") return true;
  if (filter === "urgent") return status === "renewal_due" || status === "expired";
  return status === filter;
}

export default function TenancyPortfolio({ tenancies }: TenancyPortfolioProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() =>
    parseFilterParam(searchParams.get("filter"))
  );

  useEffect(() => {
    setStatusFilter(parseFilterParam(searchParams.get("filter")));
  }, [searchParams]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tenancies.filter((tenancy) => {
      const status = getTenancyStatus(tenancy);
      const matchesStatus = matchesStatusFilter(status, statusFilter);
      const matchesSearch =
        !query ||
        tenancy.tenant_names.toLowerCase().includes(query) ||
        tenancy.property_address.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, tenancies]);

  return (
    <div id="tenancy-grid">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by tenant or address..."
          className={`${searchInputClassName} max-w-md text-tenancy-text placeholder:text-steel/50 focus:border-navy`}
        />

        <div
          className="flex flex-wrap gap-1 px-2 py-2"
          role="group"
          aria-label="Filter tenancies by status"
          style={{ backgroundColor: "#1B2339" }}
        >
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["renewal_due", "Renewal Due"],
              ["expired", "Expired"],
            ] as const
          ).map(([value, label]) => {
            const isActive =
              statusFilter === value ||
              (statusFilter === "urgent" &&
                (value === "renewal_due" || value === "expired"));
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className="min-h-11 px-4 text-[11px] font-normal uppercase tracking-[0.14em] transition"
                style={
                  isActive
                    ? {
                        backgroundColor: "#F8F4EE",
                        color: "#1B2339",
                        borderBottom: "2px solid #C4A35A",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "rgba(234,230,223,0.7)",
                        borderBottom: "2px solid transparent",
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {statusFilter === "urgent" ? (
        <p className="mb-6 text-sm font-light text-steel">
          Showing tenancies with renewals due or expired.
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm font-light text-steel">
          No tenancies match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tenancy) => (
            <TenancyCard
              key={tenancy.id}
              tenancy={tenancy}
              status={getTenancyStatus(tenancy)}
            />
          ))}
        </div>
      )}

      {tenancies.some(isDepositProtectionOverdue) && (
        <p className="mt-8 border border-urgent/20 bg-urgent-light/40 px-4 py-3 text-sm text-urgent">
          One or more tenancies have overdue deposit protection. Review your
          portfolio for compliance.
        </p>
      )}
    </div>
  );
}
