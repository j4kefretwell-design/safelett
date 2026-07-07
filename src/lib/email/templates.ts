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
  <body style="margin:0;padding:0;background-color:#EAECE4;font-family:Georgia,'Times New Roman',Times,serif;color:#33181C;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#EAECE4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#F5F0E8;border:1px solid rgba(51,24,28,0.12);">
            <tr>
              <td style="background-color:#33181C;padding:28px 32px;text-align:center;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',Times,serif;font-size:17px;font-weight:400;color:#EAECE4;letter-spacing:0.22em;text-transform:uppercase;">
                  FRETWELL <span style="font-style:italic;color:#C4A35A;">&amp;</span> CO
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;background-color:#EAECE4;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid rgba(51,24,28,0.1);background-color:#F5F0E8;text-align:center;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#33181C;">Fretwell &amp; Co</p>
                <p style="margin:0 0 4px;font-size:12px;color:#5C4A3A;">Property Compliance Management</p>
                <p style="margin:0;font-size:12px;">
                  <a href="https://fretwellcompliance.uk" style="color:#33181C;text-decoration:none;">fretwellcompliance.uk</a>
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
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#0f172a;padding:24px 32px;">
                <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${BRAND_NAME}</p>
                <p style="margin:6px 0 0;font-size:13px;color:#cbd5e1;">Property compliance tracking for UK property managers</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
                <p style="margin:0;font-size:12px;color:#64748b;text-align:center;">
                  You are receiving this email from ${BRAND_NAME}.
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

interface WelcomeEmailParams {
  dashboardUrl: string;
}

export function buildWelcomeEmail({ dashboardUrl }: WelcomeEmailParams) {
  const subject = `Welcome to ${BRAND_NAME}`;

  const html = brandWelcomeEmailLayout(`
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',Times,serif;font-size:24px;font-weight:400;color:#33181C;letter-spacing:0.02em;">
      Welcome to Fretwell &amp; Co.
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;font-weight:300;color:#33181C;">
      Your account is now active. Here is how to get started:
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:0 0 16px;font-size:15px;line-height:1.7;font-weight:300;color:#33181C;">
          <strong style="font-weight:600;">Add your first property</strong> — go to Add Property in your dashboard and enter the property details.
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 16px;font-size:15px;line-height:1.7;font-weight:300;color:#33181C;">
          <strong style="font-weight:600;">Upload your certificates</strong> — add compliance certificates for each property with their expiry dates.
        </td>
      </tr>
      <tr>
        <td style="padding:0;font-size:15px;line-height:1.7;font-weight:300;color:#33181C;">
          <strong style="font-weight:600;">Save your contractors</strong> — add your trusted contractors so Fretwell &amp; Co can draft booking emails automatically.
        </td>
      </tr>
    </table>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.7;font-weight:300;color:#33181C;">
      Your portfolio is now protected.
    </p>
    <p style="margin:0 0 28px;font-size:14px;line-height:1.7;font-weight:300;color:#5C4A3A;">
      If you have any questions, reply to this email or contact us at
      <a href="mailto:support@fretwellcompliance.uk" style="color:#33181C;text-decoration:underline;">support@fretwellcompliance.uk</a>
    </p>
    <a href="${dashboardUrl}" style="display:inline-block;background-color:#33181C;color:#EAECE4;text-decoration:none;font-size:13px;font-weight:400;letter-spacing:0.1em;text-transform:uppercase;padding:14px 24px;">
      Go to your dashboard
    </a>
  `);

  return { subject, html };
}
