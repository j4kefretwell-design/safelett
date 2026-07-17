import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppBaseUrl } from "@/lib/stripe";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim().toLowerCase() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    // Always return the same public response so this endpoint cannot be used
    // to discover which email addresses have an account.
    if (error || !data.properties.hashed_token) {
      if (error) {
        console.warn("[forgot-password] Recovery link not generated:", error.message);
      }
      return NextResponse.json({ sent: true });
    }

    const resetUrl = new URL("/auth/confirm", getAppBaseUrl());
    resetUrl.searchParams.set("token_hash", data.properties.hashed_token);
    resetUrl.searchParams.set("type", "recovery");
    resetUrl.searchParams.set("next", "/reset-password");

    const result = await sendPasswordResetEmail({
      to: email,
      resetUrl: resetUrl.toString(),
    });

    if (result.error) {
      console.error("[forgot-password] Email delivery failed:", result.error);
      return NextResponse.json(
        { error: "We could not send the reset email. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[forgot-password] Unexpected error:", error);
    return NextResponse.json(
      { error: "We could not send the reset email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ sent: true });
}
