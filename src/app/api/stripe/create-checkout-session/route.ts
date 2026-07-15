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
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as { plan?: string; plan_name?: string };
    const plan = body.plan ?? body.plan_name;

    if (!isStripePlan(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Use compliance, tenancy, or professional." },
        { status: 400 }
      );
    }

    const priceId = getStripePriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe price IDs are not configured. Set STRIPE_PRICE_COMPLIANCE, STRIPE_PRICE_TENANCY, and STRIPE_PRICE_PROFESSIONAL in .env.local.",
        },
        { status: 500 }
      );
    }

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = getStripe();
    const baseUrl = getAppBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription`,
      client_reference_id: user.id,
      customer: existing?.stripe_customer_id || undefined,
      customer_email: existing?.stripe_customer_id ? undefined : user.email,
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
      return NextResponse.json(
        { error: "Failed to create Stripe Checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout session failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
