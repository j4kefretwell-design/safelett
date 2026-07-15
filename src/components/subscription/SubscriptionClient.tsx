"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  calculateSubscriptionSummary,
  SUBSCRIPTION_MODULES,
  type SubscriptionModuleId,
  type SubscriptionSelection,
} from "@/lib/subscription";

function planFromSelection(
  selection: SubscriptionSelection
): SubscriptionModuleId | null {
  if (selection.professional) return "professional";
  if (selection.compliance && selection.tenancy) return null;
  if (selection.compliance) return "compliance";
  if (selection.tenancy) return "tenancy";
  return null;
}

export default function SubscriptionClient() {
  const [selection, setSelection] = useState<SubscriptionSelection>({
    compliance: false,
    tenancy: false,
    professional: false,
  });
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionModuleId | null>(
    null
  );
  const [managing, setManaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const next = { ...current, [id]: !current[id], professional: false };
      if (next.compliance && next.tenancy) {
        // Both selected shows £55 bundle in the summary bar
      }
      return next;
    });
  }

  async function startCheckout(plan: SubscriptionModuleId) {
    console.log("[subscription] startCheckout clicked", plan);
    setError(null);
    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ plan }),
      });

      console.log(
        "[subscription] API HTTP status:",
        response.status,
        response.statusText
      );

      const rawText = await response.text();
      console.log("[subscription] API raw response text:", rawText);

      let data: {
        url?: string;
        id?: string;
        sessionId?: string;
        error?: string;
      } = {};
      try {
        data = JSON.parse(rawText) as {
          url?: string;
          id?: string;
          sessionId?: string;
          error?: string;
        };
      } catch (parseError) {
        console.error("[subscription] Failed to parse API JSON:", parseError);
        throw new Error("Checkout API returned a non-JSON response.");
      }

      console.log("[subscription] API parsed response:", data);
      console.log("[subscription] data.url (used for redirect):", data.url);

      if (!response.ok) {
        throw new Error(data.error || `Checkout failed (${response.status}).`);
      }

      const checkoutUrl = data.url;
      if (!checkoutUrl || typeof checkoutUrl !== "string") {
        console.error(
          "[subscription] Missing data.url — full response was:",
          data
        );
        throw new Error(data.error || "Checkout API did not return a URL.");
      }

      console.log(
        "[subscription] About to redirect with window.location.href =",
        checkoutUrl
      );
      window.location.href = checkoutUrl;
    } catch (checkoutError) {
      console.error("[subscription] checkout failed:", checkoutError);
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout."
      );
      setLoadingPlan(null);
    }
  }

  async function continueToPayment() {
    const plan = planFromSelection(selection);
    console.log("[subscription] Continue to Payment", { selection, plan });

    if (selection.compliance && selection.tenancy && !selection.professional) {
      setError(
        "Compliance + Tenancy together is £55/month. Choose Professional (£89) for everything including AI, or use Subscribe on each plan card."
      );
      return;
    }

    if (!plan) {
      setError("Select at least one module to continue.");
      return;
    }
    await startCheckout(plan);
  }

  async function openPortal() {
    setError(null);
    setManaging(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to open billing portal.");
      }

      window.location.href = data.url;
    } catch (portalError) {
      console.error("[subscription] portal failed", portalError);
      setError(
        portalError instanceof Error
          ? portalError.message
          : "Unable to open billing portal."
      );
      setManaging(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-greige px-5 py-12 pb-44 text-umber sm:px-12 lg:px-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
            Subscription
          </p>
          <h1 className="mt-5 font-serif text-3xl tracking-wide text-umber sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-leather">
            Live pricing for Compliance, Tenancy, and Professional. Bundle
            discounts apply when you combine modules — or take Professional for
            everything including the AI Assistant.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void openPortal()}
          disabled={managing}
          className="inline-flex min-h-11 shrink-0 items-center justify-center border border-gold/50 px-5 text-[11px] font-normal uppercase tracking-[0.14em] text-gold transition hover:border-gold disabled:opacity-50"
        >
          {managing ? "Opening…" : "Manage subscription"}
        </button>
      </div>

      {/* Bundle savings */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <div className="border border-umber/10 bg-white/70 px-5 py-4">
          <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-gold">
            Bundle
          </p>
          <p className="mt-2 font-serif text-lg tracking-wide text-umber">
            Compliance + Tenancy
          </p>
          <p className="mt-1 text-sm font-light text-leather">
            £55/month{" "}
            <span className="text-gold">(save £10)</span>
          </p>
        </div>
        <div className="border border-study/20 bg-white/70 px-5 py-4">
          <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-gold">
            Best value
          </p>
          <p className="mt-2 font-serif text-lg tracking-wide text-umber">
            Professional
          </p>
          <p className="mt-1 text-sm font-light text-leather">
            £89/month{" "}
            <span className="text-gold">(save £76)</span>
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-8 border border-urgent/25 bg-urgent-light/40 px-5 py-4 text-sm text-urgent"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-5">
        {SUBSCRIPTION_MODULES.map((module) => {
          const isSelected = selection[module.id];
          const isLoading = loadingPlan === module.id;
          const isProfessional = module.id === "professional";

          return (
            <div
              key={module.id}
              className={`relative flex flex-col border ${module.borderClass} ${module.accentClass} border-t-[3px] p-6 shadow-[0_8px_24px_rgba(61,43,31,0.06)] transition sm:p-8 ${
                isSelected ? "ring-1 ring-gold/50" : ""
              } ${
                isProfessional
                  ? "lg:-mt-3 lg:mb-[-0.75rem] lg:shadow-[0_16px_40px_rgba(28,43,35,0.12)]"
                  : ""
              }`}
            >
              {module.badge ? (
                <span className="absolute -top-3 left-6 bg-gold px-3 py-1 text-[10px] font-normal uppercase tracking-[0.16em] text-umber">
                  {module.badge}
                </span>
              ) : null}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl tracking-wide text-umber">
                    {module.name}
                  </h2>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-serif text-3xl tracking-wide text-umber">
                      £{module.price}
                    </span>
                    <span className="text-sm font-light text-leather">
                      {module.priceNote}
                    </span>
                  </p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-2 pt-1">
                  <span className="sr-only">Add {module.name} to plan</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleModule(module.id)}
                    className="h-4 w-4 accent-gold"
                  />
                  <span className="text-[10px] uppercase tracking-[0.14em] text-leather">
                    Add
                  </span>
                </label>
              </div>

              <ul className="mt-8 flex-1 space-y-3 text-sm font-light leading-relaxed text-leather">
                {module.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${module.checkClass}`}
                      strokeWidth={1.5}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={loadingPlan !== null}
                onClick={() => void startCheckout(module.id)}
                className={`mt-8 inline-flex min-h-12 w-full items-center justify-center px-6 text-[11px] font-normal uppercase tracking-[0.14em] transition disabled:opacity-50 ${module.buttonClass}`}
              >
                {isLoading ? "Redirecting…" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      {summary ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-umber px-5 py-5 sm:px-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-dusty-cream">
              <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-gold">
                Your selection
              </p>
              <p className="mt-2 text-sm font-light">
                {summary.modules.join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                {summary.savings > 0 ? (
                  <span className="text-sm text-dusty-cream/60 line-through">
                    £{summary.retail}/month
                  </span>
                ) : null}
                <span className="font-serif text-2xl tracking-wide">
                  £{summary.total}/month
                </span>
                {summary.savings > 0 ? (
                  <span className="text-xs uppercase tracking-[0.12em] text-gold">
                    Save £{summary.savings}/month
                  </span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => void continueToPayment()}
              className="inline-flex min-h-12 shrink-0 items-center justify-center bg-dusty-cream px-8 py-3 text-sm font-normal uppercase tracking-[0.1em] text-umber transition hover:bg-white disabled:opacity-50"
            >
              {loadingPlan ? "Redirecting…" : "Continue to Payment"}
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-12 text-center text-xs font-light text-leather">
        Already subscribed?{" "}
        <button
          type="button"
          onClick={() => void openPortal()}
          className="text-gold-readable underline-offset-2 transition hover:text-gold hover:underline"
        >
          Manage billing
        </button>
        {" · "}
        <Link
          href="/dashboard"
          className="text-gold-readable underline-offset-2 transition hover:text-gold hover:underline"
        >
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
