import Stripe from "stripe";
import type { SubscriptionModuleId } from "@/lib/subscription";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  stripeClient = new Stripe(secretKey);

  return stripeClient;
}

/** Canonical production site origin for Stripe redirect URLs. */
export const STRIPE_APP_ORIGIN = "https://fretwellcompliance.uk";

export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured && configured.startsWith("http")) {
    return configured;
  }
  return STRIPE_APP_ORIGIN;
}

function isValidPriceId(value: string | undefined): value is string {
  const priceId = value?.trim();
  return Boolean(
    priceId &&
      priceId.startsWith("price_") &&
      !priceId.includes("placeholder")
  );
}

export function getStripePriceId(plan: SubscriptionModuleId): string | null {
  const candidates: Array<string | undefined> =
    plan === "compliance"
      ? [
          process.env.STRIPE_PRICE_COMPLIANCE,
          process.env.STRIPE_COMPLIANCE_PRICE_ID,
        ]
      : plan === "tenancy"
        ? [
            process.env.STRIPE_PRICE_TENANCY,
            process.env.STRIPE_TENANCY_PRICE_ID,
          ]
        : [
            process.env.STRIPE_PRICE_PROFESSIONAL,
            process.env.STRIPE_PROFESSIONAL_PRICE_ID,
          ];

  for (const candidate of candidates) {
    if (isValidPriceId(candidate)) {
      return candidate.trim();
    }
  }

  console.error("[stripe] No valid price ID for plan", {
    plan,
    candidates: candidates.map((value) =>
      value ? `${value.slice(0, 12)}…` : "(unset)"
    ),
  });

  return null;
}

export function isStripePlan(value: unknown): value is SubscriptionModuleId {
  return (
    value === "compliance" || value === "tenancy" || value === "professional"
  );
}

export function subscriptionPeriodEnd(
  subscription: Stripe.Subscription
): Date | null {
  const direct = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;

  if (typeof direct === "number") {
    return new Date(direct * 1000);
  }

  const itemEnd = subscription.items?.data?.[0]?.current_period_end;
  if (typeof itemEnd === "number") {
    return new Date(itemEnd * 1000);
  }

  return null;
}
