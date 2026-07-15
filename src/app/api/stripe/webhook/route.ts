import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, isStripePlan, subscriptionPeriodEnd } from "@/lib/stripe";

export const runtime = "nodejs";

async function upsertActiveSubscription(params: {
  userId: string;
  customerId: string;
  subscriptionId: string;
  planName: string;
  status: string;
  currentPeriodEnd: Date | null;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      plan_name: params.planName,
      status: params.status,
      current_period_end: params.currentPeriodEnd?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function markUnsubscribed(subscriptionId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes("placeholder")) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.client_reference_id || session.metadata?.user_id || null;
      const planName = session.metadata?.plan_name || "professional";
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (!userId || !customerId || !subscriptionId) {
        return NextResponse.json(
          { error: "Checkout session missing required identifiers." },
          { status: 400 }
        );
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const resolvedPlan = isStripePlan(planName)
        ? planName
        : isStripePlan(subscription.metadata?.plan_name)
          ? subscription.metadata.plan_name
          : "professional";

      await upsertActiveSubscription({
        userId,
        customerId,
        subscriptionId,
        planName: resolvedPlan,
        status: subscription.status,
        currentPeriodEnd: subscriptionPeriodEnd(subscription),
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await markUnsubscribed(subscription.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
