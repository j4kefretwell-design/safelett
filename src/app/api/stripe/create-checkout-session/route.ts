import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAppBaseUrl,
  getStripe,
  getStripePriceId,
  isStripePlan,
} from "@/lib/stripe";

export async function POST(request: Request) {
  console.log("[stripe/checkout] POST received");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      console.error("[stripe/checkout] Unauthorized — no authenticated user");
      return NextResponse.json({ error: "Unauthorized. Please sign in again." }, { status: 401 });
    }

    console.log("[stripe/checkout] user", user.id, user.email);

    let body: { plan?: string; plan_name?: string } = {};
    try {
      body = (await request.json()) as { plan?: string; plan_name?: string };
    } catch {
      console.error("[stripe/checkout] Invalid JSON body");
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const plan = body.plan ?? body.plan_name;
    console.log("[stripe/checkout] requested plan", plan);

    if (!isStripePlan(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Use compliance, tenancy, or professional." },
        { status: 400 }
      );
    }

    const priceId = getStripePriceId(plan);
    console.log("[stripe/checkout] resolved priceId", priceId);

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe price IDs are not configured. Set STRIPE_PRICE_COMPLIANCE, STRIPE_PRICE_TENANCY, and STRIPE_PRICE_PROFESSIONAL (or STRIPE_*_PRICE_ID) in .env.local, then restart the dev server.",
        },
        { status: 500 }
      );
    }

    let customerId: string | undefined;
    try {
      const admin = createAdminClient();
      const { data: existing, error } = await admin
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn(
          "[stripe/checkout] subscriptions lookup skipped:",
          error.message
        );
      } else {
        customerId = existing?.stripe_customer_id || undefined;
      }
    } catch (lookupError) {
      console.warn("[stripe/checkout] subscriptions lookup failed", lookupError);
    }

    const stripe = getStripe();
    const baseUrl = getAppBaseUrl(request);
    console.log("[stripe/checkout] creating session", {
      plan,
      priceId,
      baseUrl,
      customerId: customerId ?? "(new)",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription`,
      client_reference_id: user.id,
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      metadata: {
        user_id: user.id,
        plan_name: plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: plan,
        },
      },
    });

    if (!session.url) {
      console.error("[stripe/checkout] Session created without URL", session.id);
      return NextResponse.json(
        { error: "Failed to create Stripe Checkout session." },
        { status: 500 }
      );
    }

    console.log("[stripe/checkout] success", session.id, session.url);
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout session failed.";
    console.error("[stripe/checkout] error", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
