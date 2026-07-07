import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send";
import { getUserProfile } from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let email = user?.email;

  if (!email) {
    try {
      const body = (await request.json()) as { email?: string };
      email = body.email?.trim().toLowerCase();
    } catch {
      // No JSON body provided.
    }
  }

  if (!email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    if (user) {
      await getUserProfile(supabase, user.id);
    }

    const result = await sendWelcomeEmail({ to: email });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send welcome email.",
      },
      { status: 500 }
    );
  }
}
