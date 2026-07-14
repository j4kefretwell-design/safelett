"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { formatDate } from "@/lib/compliance";
import { siteImages } from "@/lib/site-images";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  capsLabelClassName,
  editorialPagePaddingClassName,
} from "@/lib/ui";
import {
  CERTIFICATE_LABELS,
  type Certificate,
  type CertificateType,
  type Property,
} from "@/lib/types";
import type { ComplianceStatus } from "@/lib/types";

interface ReminderContractor {
  property_id: string;
  certificate_type: CertificateType;
  name: string;
  company_name: string;
  phone: string;
  email: string;
}

interface ReminderRow {
  certificate: Certificate;
  property: Property;
  daysUntilExpiry: number;
  status: ComplianceStatus;
}

interface RemindersListProps {
  reminders: ReminderRow[];
  contractors: ReminderContractor[];
}

const ACTIONED_STORAGE_KEY = "fretwell-actioned-reminders";

const URGENCY_GROUPS = [
  { key: "overdue", label: "Overdue", match: (days: number) => days < 0 },
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

const statusStripeClasses: Record<ComplianceStatus, string> = {
  green: "bg-compliant",
  amber: "bg-attention",
  red: "bg-urgent",
};

const statusTextClasses: Record<ComplianceStatus, string> = {
  green: "text-compliant",
  amber: "text-attention",
  red: "text-urgent",
};

function groupReminders(reminders: ReminderRow[]) {
  return URGENCY_GROUPS.map((group) => ({
    ...group,
    items: reminders.filter((r) => group.match(r.daysUntilExpiry)),
  })).filter((group) => group.items.length > 0);
}

function getDaysDisplay(daysUntilExpiry: number) {
  if (daysUntilExpiry < 0) {
    return {
      value: Math.abs(daysUntilExpiry),
      label: "days overdue",
    };
  }
  if (daysUntilExpiry === 0) {
    return { value: 0, label: "due today" };
  }
  return { value: daysUntilExpiry, label: "days remaining" };
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

function RemindersGoldRule() {
  return (
    <div
      className="w-full bg-gold/45"
      style={{ height: "0.5px" }}
      aria-hidden="true"
    />
  );
}

function RemindersHeroHeader({ totalCount }: { totalCount: number }) {
  return (
    <section
      className="relative h-[180px] w-full overflow-hidden sm:h-[220px]"
      style={{ backgroundColor: siteImages.rummanAmin.placeholderColor }}
    >
      <OptimizedFillImage
        image={siteImages.rummanAmin}
        alt=""
        sizes="100vw"
        priority
        quality={60}
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#1A0A0C]/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center sm:px-8">
        <p className="text-on-image caps-label text-dusty-cream">
          Compliance Reminders
        </p>
        <p className="text-on-image mt-4 font-serif text-4xl tracking-wide text-dusty-cream sm:text-5xl lg:text-6xl">
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
      <p className={`${capsLabelClassName} leading-relaxed text-leather`}>
        {overdueCount} Overdue · {weekCount} This Week · {monthCount} This Month ·{" "}
        {sixtyCount} In 60 Days
      </p>
    </div>
  );
}

interface ReminderCardProps {
  reminder: ReminderRow;
  animateIndex: number;
  contractor?: ReminderContractor;
  onActioned: (certificateId: string) => void;
  rowsVisible: boolean;
}

function ReminderCard({
  reminder,
  animateIndex,
  contractor,
  onActioned,
  rowsVisible,
}: ReminderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const certLabel = CERTIFICATE_LABELS[reminder.certificate.certificate_type];
  const daysDisplay = getDaysDisplay(reminder.daysUntilExpiry);
  const status = reminder.status;

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        rowsVisible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
      }`}
      style={{ transitionDelay: `${animateIndex * 60}ms` }}
    >
      <div className="flex border border-leather/30 bg-white">
        <div
          className={`w-1 shrink-0 ${statusStripeClasses[status]}`}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="flex min-h-[4.5rem] flex-1 items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-dusty-cream/30 sm:min-h-[5.5rem] sm:gap-6 sm:px-8 sm:py-6"
        >
          <div className="min-w-0 flex-1">
            <p className="font-serif text-base leading-snug tracking-wide text-text sm:text-lg">
              {reminder.property.address}
            </p>
            <p className={`mt-2 ${capsLabelClassName}`}>
              {certLabel}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p
              className={`font-serif text-2xl leading-none tracking-wide sm:text-3xl ${statusTextClasses[status]}`}
            >
              {daysDisplay.value}
            </p>
            <p className={`mt-2 ${capsLabelClassName} text-leather/80`}>
              {daysDisplay.label}
            </p>
          </div>
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`border border-t-0 border-leather/30 bg-white px-6 py-8 sm:px-8`}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className={capsLabelClassName}>Expiry Date</p>
                <p className="mt-2 font-serif text-base leading-relaxed tracking-wide text-text sm:text-lg">
                  {formatDate(reminder.certificate.expiry_date)}
                </p>
              </div>
              <div>
                <p className={capsLabelClassName}>Property</p>
                <p className="mt-2 font-serif text-base leading-relaxed tracking-wide text-text sm:text-lg">
                  {reminder.property.address}
                </p>
              </div>
            </div>

            {contractor && (
              <div className="mt-8 border-t border-leather/15 pt-8">
                <p className={capsLabelClassName}>Contractor</p>
                <p className="mt-2 text-base font-light leading-relaxed text-text">
                  {contractor.name}
                  {contractor.company_name ? ` · ${contractor.company_name}` : ""}
                </p>
                <p className="mt-2 text-base font-light leading-relaxed text-leather">
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <button
                type="button"
                onClick={() => onActioned(reminder.certificate.id)}
                className={`${btnOutlineClassName} w-full sm:w-auto`}
              >
                Mark as Actioned
              </button>
              <Link
                href={`/properties/${reminder.property.id}`}
                className={`${btnPrimaryClassName} w-full sm:w-auto`}
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
    const lookup = new Map<string, ReminderContractor>();
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

  if (!hydrated) {
    return (
      <div className="min-w-0 overflow-x-hidden bg-dusty-cream">
        <RemindersGoldRule />
        <RemindersHeroHeader totalCount={reminders.length} />
      </div>
    );
  }

  if (visibleReminders.length === 0) {
    return (
      <div className="min-w-0 overflow-x-hidden bg-dusty-cream">
        <RemindersGoldRule />
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
  let animateIndex = 0;

  return (
    <div className="min-w-0 overflow-x-hidden bg-dusty-cream">
      <RemindersGoldRule />
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
              className={`flex min-h-11 items-center justify-between border-l-[3px] border-leather bg-parchment-warm py-3 ${editorialPagePaddingClassName}`}
            >
              <p className={capsLabelClassName}>{group.label}</p>
              <p className={`${capsLabelClassName} text-leather/70`}>
                {group.items.length}
              </p>
            </div>

            <div
              className={`space-y-3 py-4 ${editorialPagePaddingClassName}`}
            >
              {group.items.map((reminder) => {
                const currentAnimateIndex = animateIndex;
                animateIndex += 1;

                return (
                  <ReminderCard
                    key={reminder.certificate.id}
                    reminder={reminder}
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
