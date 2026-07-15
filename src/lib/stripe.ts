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

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://fretwellcompliance.uk"
  );
}

export function getStripePriceId(plan: SubscriptionModuleId): string | null {
  const map: Record<SubscriptionModuleId, string | undefined> = {
    compliance: process.env.STRIPE_PRICE_COMPLIANCE,
    tenancy: process.env.STRIPE_PRICE_TENANCY,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  };

  const priceId = map[plan]?.trim();
  if (!priceId || priceId.includes("placeholder")) {
    return null;
  }

  return priceId;
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
