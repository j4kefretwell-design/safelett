import { NextResponse } from "next/server";
import { sendCertificateExpiryAlerts } from "@/lib/email/alerts";

function isAuthorized(request: Request, expectedSecret: string) {
  const headerSecret = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  return headerSecret === expectedSecret || bearerSecret === expectedSecret;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 }
    );
  }

  if (!isAuthorized(request, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await sendCertificateExpiryAlerts();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send alerts.",
      },
      { status: 500 }
    );
  }
}
