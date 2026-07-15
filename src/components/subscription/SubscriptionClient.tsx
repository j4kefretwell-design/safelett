"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import {
  SUBSCRIPTION_MODULES,
  type SubscriptionModuleId,
} from "@/lib/subscription";

export default function SubscriptionClient() {
  const { mode } = useAppMode();
  const isTenancy = mode === "tenancy";
  const isAssistant = mode === "assistant";
  const isOverview = mode === "overview";

  const [loadingPlan, setLoadingPlan] = useState<SubscriptionModuleId | null>(
    null
  );
  const [managing, setManaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageBg = isTenancy
    ? "tenancy-slate-bg"
    : isAssistant
      ? "bg-greige"
      : isOverview
        ? "bg-greige"
        : "dashboard-parchment-bg";
  const headingClass = isTenancy
    ? "text-tenancy-text"
    : isOverview
      ? "text-umber"
      : "text-text";
  const mutedClass = isTenancy ? "text-steel" : "text-leather";

  const subscribeButtonClass = isTenancy
    ? "bg-navy text-dusty-cream hover:bg-navy-dark"
    : isAssistant
      ? "bg-study text-dusty-cream hover:bg-olive"
      : isOverview
        ? "bg-umber text-dusty-cream hover:bg-umber/90"
        : "bg-raspberry text-dusty-cream hover:bg-raspberry-dark";

  async function startCheckout(plan: SubscriptionModuleId) {
    setError(null);
    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout."
      );
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setError(null);
    setManaging(true);

    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to open billing portal.");
      }

      window.location.href = data.url;
    } catch (portalError) {
      setError(
        portalError instanceof Error
          ? portalError.message
          : "Unable to open billing portal."
      );
      setManaging(false);
    }
  }

  return (
    <div className={`${pageBg} min-h-[calc(100vh-4rem)] px-5 py-12 pb-24 sm:px-12 lg:px-16`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
            Subscription
          </p>
          <h1 className={`mt-5 font-serif text-3xl tracking-wide sm:text-4xl ${headingClass}`}>
            Choose Your Plan
          </h1>
          <p className={`mt-4 max-w-2xl text-sm font-light leading-relaxed ${mutedClass}`}>
            Subscribe to Compliance, Tenancy, or Professional. Manage billing
            and payment methods any time through Stripe.
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

      {error ? (
        <div className="mt-8 border border-urgent/25 bg-urgent-light/40 px-5 py-4 text-sm text-urgent">
          {error}
        </div>
      ) : null}

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {SUBSCRIPTION_MODULES.map((module) => {
          const isLoading = loadingPlan === module.id;

          return (
            <div
              key={module.id}
              className={`flex flex-col border ${module.borderClass} ${module.accentClass} border-t-[3px] p-6 shadow-sm sm:p-8`}
            >
              <div>
                <h2 className={`font-serif text-2xl tracking-wide ${headingClass}`}>
                  {module.name}
                </h2>
                <p className={`mt-2 text-sm ${mutedClass}`}>
                  £{module.price}
                  {module.id !== "professional"
                    ? "/month"
                    : "/month (includes everything)"}
                </p>
              </div>

              <ul
                className={`mt-8 flex-1 space-y-3 text-sm font-light leading-relaxed ${mutedClass}`}
              >
                {module.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"
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
                className={`mt-8 inline-flex min-h-12 w-full items-center justify-center px-6 text-[11px] font-normal uppercase tracking-[0.14em] transition disabled:opacity-50 ${subscribeButtonClass}`}
              >
                {isLoading ? "Redirecting…" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      <p className={`mt-10 text-center text-xs font-light ${mutedClass}`}>
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
