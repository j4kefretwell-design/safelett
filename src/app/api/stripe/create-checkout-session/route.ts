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
const PRODUCT_HUNT_PROMO_CODE = "PRODUCTHUNT20";
const PRODUCT_HUNT_COUPON_ID = "producthunt20-first-3-months";

function isMissingStripeResource(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "resource_missing"
  );
}

async function getProductHuntPromotionCodeId(
  stripe: ReturnType<typeof getStripe>
): Promise<string> {
  const existingCodes = await stripe.promotionCodes.list({
    code: PRODUCT_HUNT_PROMO_CODE,
    active: true,
    limit: 1,
  });
  const existingCode = existingCodes.data[0];
  if (existingCode) return existingCode.id;

  let coupon: Stripe.Coupon | null = null;
  try {
    const existingCoupon = await stripe.coupons.retrieve(
      PRODUCT_HUNT_COUPON_ID
    );
    if (!existingCoupon.deleted) coupon = existingCoupon;
  } catch (error) {
    if (!isMissingStripeResource(error)) throw error;
  }

  if (coupon) {
    if (
      coupon.percent_off !== 20 ||
      coupon.duration !== "repeating" ||
      coupon.duration_in_months !== 3
    ) {
      throw new Error(
        "The Stripe PRODUCTHUNT20 coupon exists with incorrect discount settings."
      );
    }
  } else {
    coupon = await stripe.coupons.create(
      {
        id: PRODUCT_HUNT_COUPON_ID,
        name: "Product Hunt — 20% off first 3 months",
        percent_off: 20,
        duration: "repeating",
        duration_in_months: 3,
        metadata: { campaign: "PRODUCTHUNT20" },
      },
      { idempotencyKey: "create-producthunt20-coupon-v1" }
    );
  }

  const promotionCode = await stripe.promotionCodes.create(
    {
      code: PRODUCT_HUNT_PROMO_CODE,
      promotion: {
        type: "coupon",
        coupon: coupon.id,
      },
      metadata: { campaign: "PRODUCTHUNT20" },
    },
    { idempotencyKey: "create-producthunt20-promotion-code-v1" }
  );

  return promotionCode.id;
}

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

    let body: { plan?: string; plan_name?: string; promoCode?: string } = {};
    try {
      body = (await request.json()) as {
        plan?: string;
        plan_name?: string;
        promoCode?: string;
      };
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
    console.log("[stripe/checkout] price ID being used:", priceId);

    if (!priceId) {
      console.error("[stripe/checkout] No price ID resolved for plan:", plan);
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
    const promoCode = body.promoCode?.trim().toUpperCase() ?? "";
    let promotionCodeId: string | undefined;

    if (promoCode) {
      if (promoCode !== PRODUCT_HUNT_PROMO_CODE) {
        return NextResponse.json(
          { error: "This promo code is not valid." },
          { status: 400 }
        );
      }

      promotionCodeId = await getProductHuntPromotionCodeId(stripe);
    }

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
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : {}),
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

    console.log("[stripe/checkout] full Stripe session object:", JSON.stringify(session, null, 2));
    console.log("[stripe/checkout] session.url specifically:", session.url);
    console.log("[stripe/checkout] session.id specifically:", session.id);

    if (!session.url || typeof session.url !== "string") {
      console.error("[stripe/checkout] Missing session.url — full session:", session);
      return NextResponse.json(
        {
          error: "Stripe did not return a checkout URL.",
          id: session.id,
          sessionId: session.id,
        },
        { status: 500 }
      );
    }

    console.log("[stripe/checkout] returning to frontend:", {
      url: session.url,
      id: session.id,
    });

    // Frontend must redirect using `url` (session.url), not `id`
    return NextResponse.json({
      url: session.url,
      id: session.id,
      sessionId: session.id,
    });
  } catch (error) {
    const message = stripeErrorMessage(error);
    console.error("[stripe/checkout] caught error:", message);
    console.error("[stripe/checkout] caught error (raw):", error);
    if (error && typeof error === "object") {
      console.error(
        "[stripe/checkout] caught error keys:",
        Object.keys(error as object)
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
