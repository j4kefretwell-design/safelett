"use client";

import { useMemo, useState } from "react";
import TenancyCard from "@/components/tenancy/TenancyCard";
import {
  getTenancyStatus,
  isDepositProtectionOverdue,
  type Tenancy,
} from "@/lib/tenancy";
import { searchInputClassName } from "@/lib/ui";

interface TenancyPortfolioProps {
  tenancies: Tenancy[];
}

export default function TenancyPortfolio({ tenancies }: TenancyPortfolioProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "renewal_due" | "expired"
  >("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tenancies.filter((tenancy) => {
      const status = getTenancyStatus(tenancy);
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;
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

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["renewal_due", "Renewal Due"],
              ["expired", "Expired"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`min-h-10 border px-4 py-2 text-[11px] font-normal uppercase tracking-[0.1em] transition ${
                statusFilter === value
                  ? "border-navy bg-navy text-dusty-cream"
                  : "border-steel/30 bg-white text-steel hover:border-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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
