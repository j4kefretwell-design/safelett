"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimateIn } from "@/components/AnimateIn";
import { formatDate } from "@/lib/compliance";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  editorialBleedClassName,
  editorialContentClassName,
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
    bandClass: "bg-urgent text-dusty-cream",
    match: (days: number) => days < 0,
  },
  {
    key: "7days",
    label: "Due Within 7 Days",
    bandClass: "bg-attention text-dusty-cream",
    match: (days: number) => days >= 0 && days <= 7,
  },
  {
    key: "30days",
    label: "Due Within 30 Days",
    bandClass: "bg-leather text-dusty-cream/95",
    match: (days: number) => days > 7 && days <= 30,
  },
  {
    key: "60days",
    label: "Due Within 60 Days",
    bandClass: "bg-raspberry text-dusty-cream/90",
    match: (days: number) => days > 30 && days <= 60,
  },
  {
    key: "90days",
    label: "Due Within 90 Days",
    bandClass: "bg-espresso text-dusty-cream/85",
    match: (days: number) => days > 60 && days <= 90,
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
    return "expires today";
  }

  return `${daysUntilExpiry} days remaining`;
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

function RemindersHeader() {
  return (
    <header
      className={`relative h-[180px] overflow-hidden ${editorialBleedClassName}`}
    >
      <Image
        src="/rumman-amin-CU0dmWuIz0c-unsplash.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/70 to-espresso/55" />
      <div className="relative z-10 flex h-full items-center px-8 sm:px-12 lg:px-16">
        <h1 className="font-serif text-3xl tracking-wide text-dusty-cream sm:text-4xl">
          Compliance Reminders
        </h1>
      </div>
    </header>
  );
}

interface ReminderAccordionRowProps {
  reminder: ReminderRow;
  rowIndex: number;
  contractor?: PropertyContractor;
  onActioned: (certificateId: string) => void;
}

function ReminderAccordionRow({
  reminder,
  rowIndex,
  contractor,
  onActioned,
}: ReminderAccordionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const certLabel = CERTIFICATE_LABELS[reminder.certificate.certificate_type];
  const daysLabel = formatDaysLabel(reminder.daysUntilExpiry);
  const rowBg = rowIndex % 2 === 0 ? "bg-dusty-cream" : "bg-sand";

  return (
    <div className={`${rowBg} transition-colors`}>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className={`${editorialContentClassName} flex w-full items-center justify-between gap-6 py-5 text-left transition hover:bg-tan/10 sm:py-6`}
      >
        <span className="min-w-0 font-serif text-base tracking-wide text-text sm:text-lg">
          {certLabel}
          <span className="mx-3 text-leather/40" aria-hidden="true">
            ·
          </span>
          <span className="font-sans text-sm font-light text-leather sm:text-base">
            {reminder.property.address}
          </span>
        </span>
        <span className="shrink-0 text-[10px] font-normal uppercase tracking-[0.14em] text-tan">
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
            className={`${editorialContentClassName} border-l-[3px] border-espresso pb-8 pl-6 sm:pl-8`}
          >
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Property
                </p>
                <p className="mt-2 font-serif text-xl tracking-wide text-text">
                  {reminder.property.address}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Certificate
                </p>
                <p className="mt-2 font-serif text-xl tracking-wide text-text">
                  {certLabel}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Expiry Date
                </p>
                <p className="mt-2 font-serif text-xl tracking-wide text-text">
                  {formatDate(reminder.certificate.expiry_date)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-leather">
                  Days Remaining
                </p>
                <p className="mt-2 font-serif text-xl tracking-wide text-text">
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

            <div className="mt-8 flex flex-wrap gap-4">
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
    () => reminders.filter((r) => !actionedIds.has(r.certificate.id)),
    [reminders, actionedIds]
  );

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
      <AnimateIn>
        <RemindersHeader />
      </AnimateIn>
    );
  }

  if (visibleReminders.length === 0) {
    return (
      <>
        <AnimateIn>
          <RemindersHeader />
        </AnimateIn>

        <AnimateIn delay={100}>
          <div className={`${editorialContentClassName} py-20 text-center`}>
            <p className="font-serif text-2xl tracking-wide text-text">
              No upcoming reminders
            </p>
            <p className={`${mutedTextClassName} mt-4`}>
              Nothing is due within the next 90 days across your portfolio.
            </p>
          </div>
        </AnimateIn>
      </>
    );
  }

  const groups = groupReminders(visibleReminders);
  let globalRowIndex = 0;

  return (
    <>
      <AnimateIn>
        <RemindersHeader />
      </AnimateIn>

      <div className="space-y-0">
        {groups.map((group) => (
          <div key={group.key}>
            <p
              className={`px-8 py-4 text-[10px] font-normal uppercase tracking-[0.28em] sm:px-12 lg:px-16 ${group.bandClass} ${editorialBleedClassName}`}
            >
              {group.label}
            </p>

            <div>
              {group.items.map((reminder) => {
                const rowIndex = globalRowIndex;
                globalRowIndex += 1;

                return (
                  <ReminderAccordionRow
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
