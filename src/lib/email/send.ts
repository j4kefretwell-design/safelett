import type { ExpiryAlertDay } from "@/lib/compliance";
import { getFromEmail, getResendClient } from "./resend";
import {
  buildExpiryAlertEmail,
  buildTenancyAlertEmail,
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
  contractor,
}: {
  to: string;
  propertyAddress: string;
  certificateLabel: string;
  expiryDate: string;
  daysRemaining: number;
  alertTier: ExpiryAlertDay;
  contractor?: {
    name: string;
    companyName: string;
    phone: string;
    email: string;
  };
}) {
  const { subject, html } = buildExpiryAlertEmail({
    propertyAddress,
    certificateLabel,
    expiryDate,
    daysRemaining,
    alertTier,
    dashboardUrl: `${getAppUrl()}/dashboard`,
    contractor,
  });

  const resend = getResendClient();

  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
  });
}

export async function sendTenancyAlertEmail({
  to,
  alertType,
  tenantNames,
  propertyAddress,
  alertLabel,
  dueDate,
  daysRemaining,
  alertTier,
}: {
  to: string;
  alertType: "tenancy_end" | "rent_review" | "deposit_overdue" | "right_to_rent";
  tenantNames: string;
  propertyAddress: string;
  alertLabel: string;
  dueDate: string;
  daysRemaining: number;
  alertTier: number;
}) {
  const { subject, html } = buildTenancyAlertEmail({
    alertType,
    tenantNames,
    propertyAddress,
    alertLabel,
    dueDate,
    daysRemaining,
    alertTier,
    dashboardUrl: `${getAppUrl()}/tenancy/dashboard`,
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
