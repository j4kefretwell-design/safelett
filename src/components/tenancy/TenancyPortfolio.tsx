"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  formatCurrency,
  formatTenancyDate,
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  TENANCY_STATUS_LABELS,
  type Tenancy,
  type TenancyStatus,
} from "@/lib/tenancy";
import { searchInputClassName } from "@/lib/ui";

const STATUS_DOT_COLORS: Record<TenancyStatus, string> = {
  active: "#4A6B55",
  renewal_due: "#8B7355",
  expired: "#7A4048",
};

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
        <p
          className="py-14 text-center text-base font-light italic leading-relaxed"
          style={{ color: "#60544D" }}
        >
          No tenancies match your search.
        </p>
      ) : (
        <div style={{ borderTop: "1px solid rgba(196,163,90,0.35)" }}>
          {filtered.map((tenancy) => {
            const status = getTenancyStatus(tenancy);
            const daysRemaining = getDaysUntilDate(tenancy.end_date);
            return (
              <Link
                key={tenancy.id}
                href={`/tenancy/${tenancy.id}`}
                className="group flex flex-col gap-3 py-6 transition sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                style={{ borderBottom: "1px solid rgba(196,163,90,0.35)" }}
              >
                <div className="min-w-0">
                  <h3
                    className="truncate font-serif text-lg font-normal tracking-wide transition group-hover:opacity-70 sm:text-xl"
                    style={{ color: "#60544D" }}
                  >
                    {tenancy.tenant_names}
                  </h3>
                  <p
                    className="mt-1 text-xs font-light"
                    style={{ color: "rgba(96,84,77,0.65)" }}
                  >
                    {tenancy.property_address} ·{" "}
                    {formatCurrency(Number(tenancy.monthly_rent))}/month
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_DOT_COLORS[status] }}
                    aria-hidden="true"
                  />
                  <p
                    className="text-[11px] font-normal uppercase tracking-[0.14em]"
                    style={{ color: "#60544D" }}
                  >
                    {TENANCY_STATUS_LABELS[status]} · Ends{" "}
                    {formatTenancyDate(tenancy.end_date)}
                    {daysRemaining >= 0
                      ? ` · ${daysRemaining} days`
                      : ` · ${Math.abs(daysRemaining)} days overdue`}
                  </p>
                </div>
              </Link>
            );
          })}
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
