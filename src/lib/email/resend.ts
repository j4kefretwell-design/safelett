import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY environment variable.");
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "SafeLett <onboarding@resend.dev>";
}
