import { Resend } from "resend";
import { BRAND_DOMAIN, DEFAULT_FROM_EMAIL } from "@/lib/brand";

let resendClient: Resend | null = null;

const LEGACY_FROM_DOMAIN = "safelett.co.uk";

export function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY environment variable.");
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

function normalizeFromEmail(value: string): string {
  return value
    .replace(new RegExp(LEGACY_FROM_DOMAIN, "gi"), BRAND_DOMAIN)
    .trim();
}

export function getFromEmail(): string {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();

  if (configured) {
    return normalizeFromEmail(configured);
  }

  return DEFAULT_FROM_EMAIL;
}
