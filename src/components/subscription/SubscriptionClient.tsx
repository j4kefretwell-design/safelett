"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import {
  calculateSubscriptionSummary,
  SUBSCRIPTION_MODULES,
  type SubscriptionModuleId,
  type SubscriptionSelection,
} from "@/lib/subscription";

export default function SubscriptionClient() {
  const { mode } = useAppMode();
  const isTenancy = mode === "tenancy";
  const isAssistant = mode === "assistant";

  const [selection, setSelection] = useState<SubscriptionSelection>({
    compliance: false,
    tenancy: false,
    professional: false,
  });
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  const summary = useMemo(
    () => calculateSubscriptionSummary(selection),
    [selection]
  );

  function toggleModule(id: SubscriptionModuleId) {
    setSelection((current) => {
      if (id === "professional") {
        const next = !current.professional;
        return {
          compliance: next,
          tenancy: next,
          professional: next,
        };
      }

      const next = { ...current, [id]: !current[id] };

      if (next.professional && (!next.compliance || !next.tenancy)) {
        next.professional = false;
      }

      return next;
    });
  }

  const pageBg = isTenancy
    ? "tenancy-slate-bg"
    : isAssistant
      ? "bg-greige"
      : mode === "overview"
        ? "bg-greige"
        : "dashboard-parchment-bg";
  const headingClass =
    isTenancy ? "text-tenancy-text" : mode === "overview" ? "text-umber" : "text-text";
  const mutedClass = isTenancy ? "text-steel" : "text-leather";
  const summaryBarClass = isTenancy
    ? "bg-navy"
    : isAssistant
      ? "bg-study"
      : mode === "overview"
        ? "bg-umber"
        : "bg-raspberry";

  return (
    <div className={`${pageBg} min-h-[calc(100vh-4rem)] px-5 py-12 pb-40 sm:px-12 lg:px-16`}>
      <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
        Subscription
      </p>
      <h1 className={`mt-5 font-serif text-3xl tracking-wide sm:text-4xl ${headingClass}`}>
        Build Your Plan
      </h1>
      <p className={`mt-4 max-w-2xl text-sm font-light leading-relaxed ${mutedClass}`}>
        Select the modules you need. Bundle discounts apply automatically when
        you combine Compliance and Tenancy, or choose Professional for everything.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {SUBSCRIPTION_MODULES.map((module) => {
          const isSelected = selection[module.id];

          return (
            <div
              key={module.id}
              className={`flex flex-col border ${module.borderClass} ${module.accentClass} border-t-[3px] p-6 shadow-sm transition sm:p-8 ${
                isSelected ? "ring-1 ring-gold/50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={`font-serif text-2xl tracking-wide ${headingClass}`}>
                    {module.name}
                  </h2>
                  <p className={`mt-2 text-sm ${mutedClass}`}>
                    £{module.price}
                    {module.id !== "professional" ? "/month" : "/month (includes everything)"}
                  </p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-2">
                  <span className="sr-only">Add {module.name} to plan</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleModule(module.id)}
                    className="h-4 w-4 accent-gold"
                  />
                  <span className={`text-[10px] uppercase tracking-[0.14em] ${mutedClass}`}>
                    Add to plan
                  </span>
                </label>
              </div>

              <ul className={`mt-8 flex-1 space-y-3 text-sm font-light leading-relaxed ${mutedClass}`}>
                {module.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {showPaymentNotice && (
        <div className="mt-8 border border-gold/40 bg-white px-6 py-4 text-sm text-umber">
          Coming Soon — Stripe integration in progress
        </div>
      )}

      {summary && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 ${summaryBarClass} px-5 py-5 sm:px-12`}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-dusty-cream">
              <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-gold">
                Your selection
              </p>
              <p className="mt-2 text-sm font-light">
                {summary.modules.join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                {summary.savings > 0 && (
                  <span className="text-sm text-dusty-cream/60 line-through">
                    £{summary.retail}/month
                  </span>
                )}
                <span className="font-serif text-2xl tracking-wide">
                  £{summary.total}/month
                </span>
                {summary.savings > 0 && (
                  <span className="text-xs uppercase tracking-[0.12em] text-gold">
                    Save £{summary.savings}/month
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPaymentNotice(true)}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center px-8 py-3 text-sm font-normal uppercase tracking-[0.1em] transition ${
                isTenancy
                  ? "bg-white text-navy hover:bg-dusty-cream"
                  : isAssistant
                    ? "bg-dusty-cream text-study hover:bg-white"
                    : "bg-dusty-cream text-raspberry hover:bg-white"
              }`}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
