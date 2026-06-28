import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send";
import { getUserProfile } from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await getUserProfile(supabase, user.id);

    const result = await sendWelcomeEmail({ to: user.email });

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
