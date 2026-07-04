"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/compliance";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  editorialBleedClassName,
  mutedTextClassName,
} from "@/lib/ui";
import {
  CERTIFICATE_LABELS,
  type Certificate,
  type Property,
  type PropertyContractor,
} from "@/lib/types";
import type { ComplianceStatus } from "@/lib/types";

interface ReminderRow {
  certificate: Certificate;
  property: Property;
  daysUntilExpiry: number;
  status: ComplianceStatus;
}

interface RemindersListProps {
  reminders: ReminderRow[];
  contractors: PropertyContractor[];
}

const ACTIONED_STORAGE_KEY = "fretwell-actioned-reminders";

const URGENCY_GROUPS = [
  {
    key: "overdue",
    label: "Overdue",
    bandClass: "bg-raspberry",
    match: (days: number) => days < 0,
  },
  {
    key: "7days",
    label: "Due Within 7 Days",
    bandClass: "bg-espresso",
    match: (days: number) => days >= 0 && days <= 7,
  },
  {
    key: "30days",
    label: "Due Within 30 Days",
    bandClass: "bg-raspberry",
    match: (days: number) => days > 7 && days <= 30,
  },
] as const;

function groupReminders(reminders: ReminderRow[]) {
  return URGENCY_GROUPS.map((group) => ({
    ...group,
    items: reminders.filter((r) => group.match(r.daysUntilExpiry)),
  })).filter((group) => group.items.length > 0);
}

function formatDaysLabel(daysUntilExpiry: number): string {
  if (daysUntilExpiry < 0) {
    return `${Math.abs(daysUntilExpiry)} days overdue`;
  }

  if (daysUntilExpiry === 0) {
    return "Today";
  }

  return `${daysUntilExpiry} days`;
}

function loadActionedIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const stored = window.localStorage.getItem(ACTIONED_STORAGE_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored) as string[]);
  } catch {
    return new Set();
  }
}

function RemindersStickyBar({
  overdueCount,
  weekCount,
  monthCount,
}: {
  overdueCount: number;
  weekCount: number;
  monthCount: number;
}) {
  return (
    <div
      className={`sticky top-[57px] z-20 border-b border-leather/15 bg-dusty-cream px-8 py-4 sm:px-12 lg:top-0 lg:px-16 ${editorialBleedClassName}`}
    >
      <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-leather">
        {overdueCount} Overdue · {weekCount} Due This Week · {monthCount} Due
        This Month
      </p>
    </div>
  );
}

interface ReminderTableRowProps {
  reminder: ReminderRow;
  rowIndex: number;
  contractor?: PropertyContractor;
  onActioned: (certificateId: string) => void;
}

function ReminderTableRow({
  reminder,
  rowIndex,
  contractor,
  onActioned,
}: ReminderTableRowProps) {
  const [expanded, setExpanded] = useState(false);
  const certLabel = CERTIFICATE_LABELS[reminder.certificate.certificate_type];
  const daysLabel = formatDaysLabel(reminder.daysUntilExpiry);
  const rowBg = rowIndex % 2 === 0 ? "bg-dusty-cream" : "bg-sand";

  return (
    <div className={rowBg}>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="grid w-full grid-cols-1 gap-3 border-b border-leather/10 px-8 py-5 text-left transition hover:bg-tan/10 sm:grid-cols-[7.5rem_1fr_11rem_7.5rem] sm:items-center sm:gap-6 sm:px-12 sm:py-6 lg:px-16"
      >
        <span className="font-serif text-lg tracking-wide text-text sm:text-xl">
          {formatDate(reminder.certificate.expiry_date)}
        </span>
        <span className="min-w-0 font-serif text-base tracking-wide text-text sm:text-lg">
          {reminder.property.address}
        </span>
        <span className="text-[10px] font-normal uppercase tracking-[0.14em] text-leather">
          {certLabel}
        </span>
        <span className="text-[10px] font-normal uppercase tracking-[0.14em] text-tan sm:text-right">
          {daysLabel}
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className="border-b border-l-[3px] border-l-espresso border-leather/10 px-8 py-8 sm:px-12 lg:px-16"
          >
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Date
                </p>
                <p className="mt-2 font-serif text-lg tracking-wide text-text">
                  {formatDate(reminder.certificate.expiry_date)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Property
                </p>
                <p className="mt-2 font-serif text-lg tracking-wide text-text">
                  {reminder.property.address}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Certificate
                </p>
                <p className="mt-2 font-serif text-lg tracking-wide text-text">
                  {certLabel}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Days Remaining
                </p>
                <p className="mt-2 font-serif text-lg tracking-wide text-text">
                  {daysLabel}
                </p>
              </div>
            </div>

            {contractor && (
              <div className="mt-8 border-t border-leather/15 pt-8">
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Contractor
                </p>
                <p className="mt-2 text-sm font-light text-text">
                  {contractor.name}
                  {contractor.company_name ? ` · ${contractor.company_name}` : ""}
                </p>
                <p className="mt-2 text-sm font-light text-leather">
                  <a
                    href={`tel:${contractor.phone.replace(/\s/g, "")}`}
                    className="transition hover:text-text"
                  >
                    {contractor.phone}
                  </a>
                  {" · "}
                  <a
                    href={`mailto:${contractor.email}`}
                    className="transition hover:text-text"
                  >
                    {contractor.email}
                  </a>
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onActioned(reminder.certificate.id)}
                className={btnOutlineClassName}
              >
                Mark as Actioned
              </button>
              <Link
                href={`/properties/${reminder.property.id}`}
                className={btnPrimaryClassName}
              >
                View Property
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RemindersList({
  reminders,
  contractors,
}: RemindersListProps) {
  const [actionedIds, setActionedIds] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActionedIds(loadActionedIds());
    setHydrated(true);
  }, []);

  const contractorLookup = useMemo(() => {
    const lookup = new Map<string, PropertyContractor>();
    for (const contractor of contractors) {
      lookup.set(
        `${contractor.property_id}:${contractor.certificate_type}`,
        contractor
      );
    }
    return lookup;
  }, [contractors]);

  const visibleReminders = useMemo(
    () =>
      reminders.filter(
        (r) => !actionedIds.has(r.certificate.id) && r.daysUntilExpiry <= 30
      ),
    [reminders, actionedIds]
  );

  const overdueCount = visibleReminders.filter((r) => r.daysUntilExpiry < 0).length;
  const weekCount = visibleReminders.filter(
    (r) => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 7
  ).length;
  const monthCount = visibleReminders.filter(
    (r) => r.daysUntilExpiry > 7 && r.daysUntilExpiry <= 30
  ).length;

  const handleActioned = useCallback((certificateId: string) => {
    setActionedIds((current) => {
      const next = new Set(current);
      next.add(certificateId);

      try {
        window.localStorage.setItem(
          ACTIONED_STORAGE_KEY,
          JSON.stringify([...next])
        );
      } catch {
        // Ignore storage failures — session dismiss still works.
      }

      return next;
    });
  }, []);

  if (!hydrated) {
    return (
      <div
        className={`border-b border-leather/15 bg-dusty-cream px-8 py-4 sm:px-12 lg:px-16 ${editorialBleedClassName}`}
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-leather">
          Loading reminders...
        </p>
      </div>
    );
  }

  if (visibleReminders.length === 0) {
    return (
      <>
        <RemindersStickyBar overdueCount={0} weekCount={0} monthCount={0} />
        <div className="px-8 py-20 text-center sm:px-12 lg:px-16">
          <p className="font-serif text-2xl tracking-wide text-text">
            No upcoming reminders
          </p>
          <p className={`${mutedTextClassName} mt-4`}>
            Nothing is due within the next 30 days across your portfolio.
          </p>
        </div>
      </>
    );
  }

  const groups = groupReminders(visibleReminders);
  let globalRowIndex = 0;

  return (
    <>
      <RemindersStickyBar
        overdueCount={overdueCount}
        weekCount={weekCount}
        monthCount={monthCount}
      />

      <div className="space-y-0">
        {groups.map((group) => (
          <div key={group.key}>
            <p
              className={`px-8 py-4 text-center text-[10px] font-normal uppercase tracking-[0.28em] text-dusty-cream sm:px-12 lg:px-16 ${group.bandClass} ${editorialBleedClassName}`}
            >
              {group.label}
            </p>

            <div className="hidden border-b border-leather/15 bg-sand/50 px-8 py-3 sm:grid sm:grid-cols-[7.5rem_1fr_11rem_7.5rem] sm:gap-6 sm:px-12 lg:px-16">
              {["Date", "Property Address", "Certificate Type", "Days Remaining"].map(
                (heading) => (
                  <span
                    key={heading}
                    className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather last:sm:text-right"
                  >
                    {heading}
                  </span>
                )
              )}
            </div>

            <div>
              {group.items.map((reminder) => {
                const rowIndex = globalRowIndex;
                globalRowIndex += 1;

                return (
                  <ReminderTableRow
                    key={reminder.certificate.id}
                    reminder={reminder}
                    rowIndex={rowIndex}
                    contractor={contractorLookup.get(
                      `${reminder.property.id}:${reminder.certificate.certificate_type}`
                    )}
                    onActioned={handleActioned}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
