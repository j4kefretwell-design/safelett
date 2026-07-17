"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { formatTenancyDate } from "@/lib/tenancy";
import { IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import { btnPrimaryClassName, capsLabelClassName } from "@/lib/ui";
import type { TenancyReminderRow } from "@/components/RemindersPageClient";

interface TenancyRemindersListProps {
  reminders: TenancyReminderRow[];
}

const GROUPS = [
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
    match: (days: number) => days > 30 && days <= 90,
  },
] as const;

export default function TenancyRemindersList({
  reminders,
}: TenancyRemindersListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleReminders = useMemo(
    () => reminders.filter((reminder) => reminder.daysRemaining <= 90),
    [reminders]
  );

  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: visibleReminders.filter((reminder) =>
          group.match(reminder.daysRemaining)
        ),
      })).filter((group) => group.items.length > 0),
    [visibleReminders]
  );

  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)]">
      <section
        className="relative h-[200px] overflow-hidden sm:h-[240px]"
        style={{ backgroundColor: siteImages.eranjanCottage.placeholderColor }}
      >
        <OptimizedFillImage
          image={siteImages.eranjanCottage}
          alt=""
          sizes="100vw"
          priority
          quality={IMAGE_QUALITY}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-navy/55" />
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-8 sm:px-12 lg:px-16">
          <p className={capsLabelClassName}>Tenancy Reminders</p>
          <h1 className="mt-3 font-serif text-3xl tracking-wide text-dusty-cream sm:text-4xl">
            {visibleReminders.length}{" "}
            {visibleReminders.length === 1 ? "Deadline" : "Deadlines"} Approaching
          </h1>
        </div>
      </section>

      <div className="sticky top-[var(--app-top-offset,4rem)] z-20 border-b border-taupe bg-vanilla/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-5 py-4 text-sm sm:px-12 lg:px-16">
          <span className="text-urgent">
            {visibleReminders.filter((r) => r.daysRemaining < 0).length} overdue
          </span>
          <span className="text-attention">
            {
              visibleReminders.filter(
                (r) => r.daysRemaining >= 0 && r.daysRemaining <= 7
              ).length
            }{" "}
            this week
          </span>
          <span className="text-steel">
            {
              visibleReminders.filter(
                (r) => r.daysRemaining > 7 && r.daysRemaining <= 30
              ).length
            }{" "}
            this month
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-12 lg:px-16">
        {grouped.length === 0 ? (
          <div className="my-8 flex flex-col items-center justify-center bg-navy px-8 py-16 text-center">
            <span className="text-2xl text-gold" aria-hidden>
              ✓
            </span>
            <p className="mt-5 font-serif text-2xl italic tracking-wide text-dusty-cream sm:text-3xl">
              All tenancies are in good order.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <section key={group.key} className="mb-12">
              <div className="bg-navy px-5 py-2.5">
                <p className="caps-label text-dusty-cream">{group.label}</p>
              </div>

              <ul className="divide-y divide-taupe border border-taupe bg-dune">
                {group.items.map((reminder) => {
                  const isExpanded = expandedId === reminder.id;

                  return (
                    <li key={reminder.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : reminder.id)
                        }
                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-8"
                      >
                        <div>
                          <p className="font-serif text-lg text-tenancy-text">
                            {reminder.tenancy.tenant_names}
                          </p>
                          <p className="mt-1 text-sm text-steel">
                            {reminder.label} · {reminder.tenancy.property_address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              reminder.daysRemaining < 0
                                ? "text-urgent"
                                : reminder.daysRemaining <= 30
                                  ? "text-attention"
                                  : "text-compliant"
                            }`}
                          >
                            {reminder.daysRemaining < 0
                              ? `${Math.abs(reminder.daysRemaining)} days overdue`
                              : `${reminder.daysRemaining} days remaining`}
                          </p>
                          <p className="mt-1 text-xs text-steel">
                            {formatTenancyDate(reminder.dueDate)}
                          </p>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-steel/10 bg-tenancy-bg px-5 py-5 sm:px-8">
                          <Link
                            href={`/tenancy/${reminder.tenancy.id}`}
                            className={`${btnPrimaryClassName} bg-navy hover:bg-navy-dark`}
                          >
                            View Tenancy
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
