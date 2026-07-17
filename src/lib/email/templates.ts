import { BRAND_NAME } from "@/lib/brand";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function brandWelcomeEmailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${BRAND_NAME}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#EAECE4;font-family:Georgia,'Times New Roman',Times,serif;color:#4A1520;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#EAECE4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#F5F0E8;border:1px solid rgba(74,21,32,0.12);">
            <tr>
              <td style="background-color:#4A1520;padding:28px 32px;text-align:center;border-bottom:2px solid #C4A35A;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',Times,serif;font-size:17px;font-weight:400;color:#EAECE4;letter-spacing:0.22em;text-transform:uppercase;">
                  FRETWELL <span style="font-style:italic;color:#C4A35A;">&amp;</span> CO
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;background-color:#F5F0E8;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid rgba(74,21,32,0.1);background-color:#F5F0E8;text-align:center;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#4A1520;">Fretwell &amp; Co</p>
                <p style="margin:0 0 4px;font-size:12px;color:#5C4A3A;">Property Compliance Management</p>
                <p style="margin:0;font-size:12px;">
                  <a href="https://fretwellcompliance.uk" style="color:#4A1520;text-decoration:none;">fretwellcompliance.uk</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${BRAND_NAME}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F5F0E8;font-family:Georgia,'Times New Roman',Times,serif;color:#4A1520;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F5F0E8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#F5F0E8;border:1px solid rgba(74,21,32,0.12);">
            <tr>
              <td style="background-color:#4A1520;padding:28px 32px;text-align:center;border-bottom:2px solid #C4A35A;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',Times,serif;font-size:17px;font-weight:400;color:#EAECE4;letter-spacing:0.22em;text-transform:uppercase;">
                  FRETWELL <span style="font-style:italic;color:#C4A35A;">&amp;</span> CO
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;background-color:#F5F0E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #C4A35A;background-color:#F5F0E8;text-align:center;">
                <p style="margin:0 0 5px;font-family:Georgia,'Times New Roman',Times,serif;font-size:13px;color:#4A1520;">Fretwell &amp; Co</p>
                <p style="margin:0;font-size:12px;">
                  <a href="https://fretwellcompliance.uk" style="color:#5C4A3A;text-decoration:none;">fretwellcompliance.uk</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

interface ExpiryAlertEmailParams {
  propertyAddress: string;
  certificateLabel: string;
  expiryDate: string;
  daysRemaining: number;
  alertTier: number;
  dashboardUrl: string;
  contractor?: {
    name: string;
    companyName: string;
    phone: string;
    email: string;
  };
}

function moduleAlertBanner(module: "compliance" | "tenancy"): string {
  const label =
    module === "compliance"
      ? "COMPLIANCE ALERT — Fretwell &amp; Co"
      : "TENANCY ALERT — Fretwell &amp; Co";
  const accentColor = module === "compliance" ? "#4A1520" : "#1A3358";

  return `<p style="margin:0 0 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:${accentColor};">${label}</p>`;
}

function buildContractorSection(
  contractor: NonNullable<ExpiryAlertEmailParams["contractor"]>
): string {
  const safeName = escapeHtml(contractor.name);
  const safeCompany = escapeHtml(contractor.companyName);
  const safePhone = escapeHtml(contractor.phone);
  const safeEmail = escapeHtml(contractor.email);
  const phoneHref = escapeHtml(contractor.phone.replace(/\s/g, ""));

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fffdf8;border:1px solid #e8d5a3;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Your contractor</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${safeName}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#475569;">${safeCompany}</p>
          <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#475569;">
            <a href="tel:${phoneHref}" style="color:#5c1a2e;text-decoration:none;font-weight:600;">${safePhone}</a>
            &nbsp;·&nbsp;
            <a href="mailto:${safeEmail}" style="color:#5c1a2e;text-decoration:none;font-weight:600;">${safeEmail}</a>
          </p>
        </td>
      </tr>
    </table>
  `;
}

function getExpirySummary(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    return daysOverdue === 1
      ? "Expired 1 day ago"
      : `Expired ${daysOverdue} days ago`;
  }

  if (daysRemaining === 0) {
    return "Expires today";
  }

  return daysRemaining === 1
    ? "Expires in 1 day"
    : `Expires in ${daysRemaining} days`;
}

function getExpirySubject(
  certificateLabel: string,
  daysRemaining: number,
  alertTier: number
): string {
  if (daysRemaining < 0) {
    return `${BRAND_NAME} Alert: ${certificateLabel} has expired`;
  }

  if (daysRemaining === 0) {
    return `${BRAND_NAME} Alert: ${certificateLabel} expires today`;
  }

  return `${BRAND_NAME} Alert: ${certificateLabel} expires within ${alertTier} days`;
}

export function buildExpiryAlertEmail({
  propertyAddress,
  certificateLabel,
  expiryDate,
  daysRemaining,
  alertTier,
  dashboardUrl,
  contractor,
}: ExpiryAlertEmailParams) {
  const safeAddress = escapeHtml(propertyAddress);
  const safeCertificate = escapeHtml(certificateLabel);
  const safeExpiryDate = escapeHtml(expiryDate);
  const expirySummary = escapeHtml(getExpirySummary(daysRemaining));
  const subject = getExpirySubject(certificateLabel, daysRemaining, alertTier);

  const html = emailLayout(`
    ${moduleAlertBanner("compliance")}
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">Certificate expiry reminder</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
      One of your compliance certificates is coming up for renewal. Please review the details below and take action before the expiry date.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Property</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${safeAddress}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Certificate</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${safeCertificate}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Expiry date</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#b45309;">${safeExpiryDate}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#64748b;">${expirySummary}</p>
        </td>
      </tr>
    </table>
    ${contractor ? buildContractorSection(contractor) : ""}
    <a href="${dashboardUrl}" style="display:inline-block;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">
      View in ${BRAND_NAME}
    </a>
  `);

  return { subject, html };
}

interface TenancyAlertEmailParams {
  alertType: "tenancy_end" | "rent_review" | "deposit_overdue" | "right_to_rent";
  tenantNames: string;
  propertyAddress: string;
  alertLabel: string;
  dueDate: string;
  daysRemaining: number;
  alertTier: number;
  dashboardUrl: string;
}

function getTenancyAlertSubject(
  alertType: TenancyAlertEmailParams["alertType"],
  propertyAddress: string,
  tenantNames: string
): string {
  const safeAddress = propertyAddress.trim();

  switch (alertType) {
    case "tenancy_end":
      return `Tenancy Renewal Due — ${safeAddress}`;
    case "rent_review":
      return `Rent Review Due — ${safeAddress}`;
    case "deposit_overdue":
      return `Deposit Protection Overdue — ${safeAddress}`;
    case "right_to_rent":
      return `Right to Rent Expiry — ${tenantNames.trim()}`;
    default:
      return `Tenancy Alert — ${safeAddress}`;
  }
}

export function buildTenancyAlertEmail({
  alertType,
  tenantNames,
  propertyAddress,
  alertLabel,
  dueDate,
  daysRemaining,
  alertTier,
  dashboardUrl,
}: TenancyAlertEmailParams) {
  const safeTenant = escapeHtml(tenantNames);
  const safeAddress = escapeHtml(propertyAddress);
  const safeLabel = escapeHtml(alertLabel);
  const safeDate = escapeHtml(dueDate);
  const summary =
    daysRemaining < 0
      ? `Overdue by ${Math.abs(daysRemaining)} days`
      : daysRemaining === 0
        ? "Due today"
        : `Due in ${daysRemaining} days`;

  const subject = getTenancyAlertSubject(alertType, propertyAddress, tenantNames);

  const html = emailLayout(`
    ${moduleAlertBanner("tenancy")}
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">Tenancy reminder</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
      A tenancy deadline in your portfolio requires attention. This alert was triggered ${alertTier > 0 ? `${alertTier} days before the due date` : "immediately"}.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Tenant</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${safeTenant}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Property</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${safeAddress}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Alert</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${safeLabel}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">Due date</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#b45309;">${safeDate}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#64748b;">${escapeHtml(summary)}</p>
        </td>
      </tr>
    </table>
    <a href="${dashboardUrl}" style="display:inline-block;background-color:#1A3358;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">
      View in ${BRAND_NAME}
    </a>
  `);

  return { subject, html };
}

interface WelcomeEmailParams {
  dashboardUrl: string;
}

export function buildWelcomeEmail({ dashboardUrl }: WelcomeEmailParams) {
  const subject = `Welcome to ${BRAND_NAME}`;

  const html = brandWelcomeEmailLayout(`
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',Times,serif;font-size:24px;font-weight:400;color:#4A1520;letter-spacing:0.02em;">
      Welcome to Fretwell &amp; Co.
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;font-weight:300;color:#4A1520;">
      Your account is now active. Here is how to get started:
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:0 0 16px;font-size:15px;line-height:1.7;font-weight:300;color:#4A1520;">
          <strong style="font-weight:600;">Add your first property</strong> — go to Add Property in your dashboard and enter the property details.
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 16px;font-size:15px;line-height:1.7;font-weight:300;color:#4A1520;">
          <strong style="font-weight:600;">Upload your certificates</strong> — add compliance certificates for each property with their expiry dates.
        </td>
      </tr>
      <tr>
        <td style="padding:0;font-size:15px;line-height:1.7;font-weight:300;color:#4A1520;">
          <strong style="font-weight:600;">Save your contractors</strong> — add your trusted contractors so Fretwell &amp; Co can draft booking emails automatically.
        </td>
      </tr>
    </table>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.7;font-weight:300;color:#4A1520;">
      Your portfolio is now protected.
    </p>
    <p style="margin:0 0 28px;font-size:14px;line-height:1.7;font-weight:300;color:#5C4A3A;">
      If you have any questions, reply to this email or contact us at
      <a href="mailto:support@fretwellcompliance.uk" style="color:#4A1520;text-decoration:underline;">support@fretwellcompliance.uk</a>
    </p>
    <a href="${dashboardUrl}" style="display:inline-block;background-color:#4A1520;color:#EAECE4;text-decoration:none;font-size:13px;font-weight:400;letter-spacing:0.1em;text-transform:uppercase;padding:14px 24px;">
      Go to your dashboard
    </a>
  `);

  return { subject, html };
}

export function buildPasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  const subject = `Reset your ${BRAND_NAME} password`;
  const safeResetUrl = escapeHtml(resetUrl);
  const html = emailLayout(`
    <p style="margin:0 0 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:#4A1520;">ACCOUNT SECURITY</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',Times,serif;font-size:24px;font-weight:400;color:#4A1520;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#5C4A3A;">
      We received a request to reset your Fretwell &amp; Co password. Use the button below to choose a new password.
    </p>
    <a href="${safeResetUrl}" style="display:inline-block;background-color:#4A1520;color:#EAECE4;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;padding:14px 24px;border-radius:4px;">
      Reset password
    </a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#5C4A3A;">
      If you did not request this change, you can safely ignore this email.
    </p>
  `);

  return { subject, html };
}
