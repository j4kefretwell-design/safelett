import type { ExpiryAlertDay } from "@/lib/compliance";
import { getFromEmail, getResendClient } from "./resend";
import {
  buildExpiryAlertEmail,
  buildWelcomeEmail,
} from "./templates";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendExpiryAlertEmail({
  to,
  propertyAddress,
  certificateLabel,
  expiryDate,
  daysRemaining,
  alertTier,
}: {
  to: string;
  propertyAddress: string;
  certificateLabel: string;
  expiryDate: string;
  daysRemaining: number;
  alertTier: ExpiryAlertDay;
}) {
  const { subject, html } = buildExpiryAlertEmail({
    propertyAddress,
    certificateLabel,
    expiryDate,
    daysRemaining,
    alertTier,
    dashboardUrl: `${getAppUrl()}/dashboard`,
  });

  const resend = getResendClient();

  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail({ to }: { to: string }) {
  const { subject, html } = buildWelcomeEmail({
    dashboardUrl: `${getAppUrl()}/dashboard`,
  });

  const resend = getResendClient();

  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
  });
}
