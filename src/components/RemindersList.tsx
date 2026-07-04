"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { formatDate } from "@/lib/compliance";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  editorialPagePaddingClassName,
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
    match: (days: number) => days < 0,
  },
  {
    key: "week",
    label: "Due This Week",
    match: (days: number) => days >= 0 && days <= 7,
  },
  {
    key: "month",
    label: "Due This Month",
    match: (days: number) => days > 7 && days <= 30,
  },
  {
    key: "sixty",
    label: "Due in 60 Days",
    match: (days: number) => days > 30 && days <= 60,
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
  if (daysUntilExpiry === 0) return "Today";
  return `${daysUntilExpiry} days`;
}

function getPropertyInitial(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "?";
  const match = trimmed.match(/[A-Za-z0-9]/);
  return match ? match[0].toUpperCase() : "?";
}

function loadActionedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = window.localStorage.getItem(ACTIONED_STORAGE_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored) as string[]);
  } catch {
    return new Set();
  }
}

function RemindersHeroHeader({ totalCount }: { totalCount: number }) {
  return (
    <section className="relative h-[220px] w-full overflow-hidden">
      <Image
        src="/rumman-amin-CU0dmWuIz0c-unsplash.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-[#1A0A0C]/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="text-[10px] font-normal uppercase tracking-[0.38em] text-dusty-cream/80">
          Compliance Reminders
        </p>
        <p className="mt-4 font-serif text-5xl tracking-wide text-dusty-cream sm:text-6xl">
          {totalCount}
        </p>
      </div>
    </section>
  );
}

function RemindersStickyBar({
  overdueCount,
  weekCount,
  monthCount,
  sixtyCount,
}: {
  overdueCount: number;
  weekCount: number;
  monthCount: number;
  sixtyCount: number;
}) {
  return (
    <div
      className={`sticky top-16 z-10 border-b border-leather/15 bg-white ${editorialPagePaddingClassName} py-3`}
    >
      <p className="text-[10px] font-normal uppercase tracking-[0.18em] text-leather/80">
        {overdueCount} Overdue · {weekCount} This Week · {monthCount} This Month ·{" "}
        {sixtyCount} In 60 Days
      </p>
    </div>
  );
}

interface ReminderTableRowProps {
  reminder: ReminderRow;
  rowIndex: number;
  animateIndex: number;
  contractor?: PropertyContractor;
  onActioned: (certificateId: string) => void;
  rowsVisible: boolean;
}

function ReminderTableRow({
  reminder,
  rowIndex,
  animateIndex,
  contractor,
  onActioned,
  rowsVisible,
}: ReminderTableRowProps) {
  const [expanded, setExpanded] = useState(false);
  const certLabel = CERTIFICATE_LABELS[reminder.certificate.certificate_type];
  const daysLabel = formatDaysLabel(reminder.daysUntilExpiry);
  const rowBg = rowIndex % 2 === 0 ? "bg-white" : "bg-dusty-cream/50";
  const propertyInitial = getPropertyInitial(reminder.property.address);

  return (
    <div
      className={`${rowBg} transition-all duration-500 ease-out ${
        rowsVisible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
      }`}
      style={{ transitionDelay: `${animateIndex * 60}ms` }}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className={`grid w-full grid-cols-1 gap-3 border-b border-leather/10 py-5 text-left transition hover:bg-dusty-cream/40 sm:grid-cols-[7.5rem_1fr_11rem_7.5rem] sm:items-center sm:gap-6 sm:py-6 ${editorialPagePaddingClassName}`}
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
        <span className="text-[10px] font-normal uppercase tracking-[0.14em] text-leather/70 sm:text-right">
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
            className={`border-b border-leather/10 py-8 ${editorialPagePaddingClassName}`}
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center bg-raspberry font-serif text-3xl tracking-wide text-dusty-cream"
                aria-hidden="true"
              >
                {propertyInitial}
              </div>

              <div className="min-w-0 flex-1">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                      Expiry · {daysLabel}
                    </p>
                    <p className="mt-2 font-serif text-lg tracking-wide text-text">
                      {formatDate(reminder.certificate.expiry_date)}
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
                      {contractor.company_name
                        ? ` · ${contractor.company_name}`
                        : ""}
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
              </div>
            </div>

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
  const [rowsVisible, setRowsVisible] = useState(false);

  useEffect(() => {
    setActionedIds(loadActionedIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => setRowsVisible(true), 50);
    return () => window.clearTimeout(timer);
  }, [hydrated]);

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
        (r) => !actionedIds.has(r.certificate.id) && r.daysUntilExpiry <= 60
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
  const sixtyCount = visibleReminders.filter(
    (r) => r.daysUntilExpiry > 30 && r.daysUntilExpiry <= 60
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
        // ignore
      }
      return next;
    });
  }, []);

  const totalForHeader = hydrated ? visibleReminders.length : reminders.length;

  if (!hydrated) {
    return (
      <div className="bg-dusty-cream">
        <RemindersHeroHeader totalCount={reminders.length} />
      </div>
    );
  }

  if (visibleReminders.length === 0) {
    return (
      <div className="bg-dusty-cream">
        <RemindersHeroHeader totalCount={0} />
        <RemindersStickyBar
          overdueCount={0}
          weekCount={0}
          monthCount={0}
          sixtyCount={0}
        />
        <section className={`py-24 text-center ${editorialPagePaddingClassName}`}>
          <Check
            className="mx-auto h-8 w-8 text-gold"
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <p className="mt-8 font-serif text-2xl tracking-wide text-text sm:text-3xl">
            No upcoming compliance deadlines.
          </p>
        </section>
      </div>
    );
  }

  const groups = groupReminders(visibleReminders);
  let globalRowIndex = 0;
  let animateIndex = 0;

  return (
    <div className="bg-dusty-cream">
      <RemindersHeroHeader totalCount={visibleReminders.length} />

      <RemindersStickyBar
        overdueCount={overdueCount}
        weekCount={weekCount}
        monthCount={monthCount}
        sixtyCount={sixtyCount}
      />

      <div>
        {groups.map((group) => (
          <div key={group.key}>
            <div
              className={`flex items-center justify-between bg-espresso px-8 py-3 sm:px-12 lg:px-16`}
            >
              <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-dusty-cream">
                {group.label}
              </p>
              <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-dusty-cream/60">
                {group.items.length}
              </p>
            </div>

            <div
              className={`hidden border-b border-leather/15 bg-white py-3 sm:grid sm:grid-cols-[7.5rem_1fr_11rem_7.5rem] sm:gap-6 ${editorialPagePaddingClassName}`}
            >
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
                const currentAnimateIndex = animateIndex;
                globalRowIndex += 1;
                animateIndex += 1;

                return (
                  <ReminderTableRow
                    key={reminder.certificate.id}
                    reminder={reminder}
                    rowIndex={rowIndex}
                    animateIndex={currentAnimateIndex}
                    rowsVisible={rowsVisible}
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
    </div>
  );
}
