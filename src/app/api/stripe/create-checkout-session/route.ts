import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getStripe,
  getStripePriceId,
  isStripePlan,
} from "@/lib/stripe";

const SUCCESS_URL = "https://fretwellcompliance.uk/subscription/success";
const CANCEL_URL = "https://fretwellcompliance.uk/subscription";

function stripeErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const stripeError = error as Stripe.StripeRawError & {
      message: string;
      param?: string;
      type?: string;
      code?: string;
      raw?: { message?: string; param?: string };
    };
    const param = stripeError.param ?? stripeError.raw?.param;
    const detail = [
      stripeError.message,
      param ? `param=${param}` : null,
      stripeError.code ? `code=${stripeError.code}` : null,
      stripeError.type ? `type=${stripeError.type}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    return detail;
  }

  if (error instanceof Error) return error.message;
  return "Checkout session failed.";
}

export async function POST(request: Request) {
  console.log("[stripe/checkout] POST received");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      console.error("[stripe/checkout] Unauthorized — no authenticated user");
      return NextResponse.json(
        { error: "Unauthorized. Please sign in again." },
        { status: 401 }
      );
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
            "Stripe price IDs are not configured. Set STRIPE_PRICE_COMPLIANCE, STRIPE_PRICE_TENANCY, and STRIPE_PRICE_PROFESSIONAL in environment variables.",
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
      } else if (
        existing?.stripe_customer_id &&
        existing.stripe_customer_id.startsWith("cus_")
      ) {
        customerId = existing.stripe_customer_id;
      }
    } catch (lookupError) {
      console.warn("[stripe/checkout] subscriptions lookup failed", lookupError);
    }

    const stripe = getStripe();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      client_reference_id: user.id,
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
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    console.log("[stripe/checkout] creating session with", {
      plan,
      priceId,
      success_url: sessionParams.success_url,
      cancel_url: sessionParams.cancel_url,
      customer: customerId ?? "(none)",
      customer_email: customerId ? "(omitted)" : user.email,
    });

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("[stripe/checkout] session created", {
      id: session.id,
      url: session.url,
      urlType: typeof session.url,
    });

    if (!session.url || typeof session.url !== "string") {
      console.error("[stripe/checkout] Missing session.url", session);
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL.", sessionId: session.id },
        { status: 500 }
      );
    }

    // Ensure the frontend only ever receives an absolute https URL
    let checkoutUrl: string;
    try {
      const parsed = new URL(session.url);
      if (parsed.protocol !== "https:") {
        throw new Error(`Unexpected checkout URL protocol: ${parsed.protocol}`);
      }
      checkoutUrl = parsed.toString();
    } catch (parseError) {
      console.error("[stripe/checkout] Invalid session.url from Stripe", {
        url: session.url,
        parseError,
      });
      return NextResponse.json(
        {
          error: "Stripe returned an invalid checkout URL.",
          url: session.url,
        },
        { status: 500 }
      );
    }

    console.log("[stripe/checkout] returning checkout URL", checkoutUrl);
    return NextResponse.json({ url: checkoutUrl, sessionId: session.id });
  } catch (error) {
    const message = stripeErrorMessage(error);
    console.error("[stripe/checkout] error", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
