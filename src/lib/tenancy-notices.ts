import { formatTenancyDate, formatCurrency, type Tenancy } from "@/lib/tenancy";

export type TenancyNoticeType =
  | "renewal_offer"
  | "rent_increase"
  | "end_of_tenancy"
  | "right_to_rent_reminder";

export interface TenancyNoticeDraft {
  subject: string;
  body: string;
}

export const TENANCY_NOTICE_LABELS: Record<TenancyNoticeType, string> = {
  renewal_offer: "Tenancy Renewal Offer",
  rent_increase: "Rent Increase Notice (Section 13)",
  end_of_tenancy: "End of Tenancy Notice",
  right_to_rent_reminder: "Right to Rent Reminder",
};

export function formatNoticeForCopy(draft: TenancyNoticeDraft): string {
  return `Subject: ${draft.subject}\n\n${draft.body}`;
}

export function buildMailtoUrl(draft: TenancyNoticeDraft, toEmail?: string): string {
  const params = new URLSearchParams({
    subject: draft.subject,
    body: draft.body,
  });

  if (toEmail) {
    return `mailto:${encodeURIComponent(toEmail)}?${params.toString()}`;
  }

  return `mailto:?${params.toString()}`;
}

export function buildGmailComposeUrl(draft: TenancyNoticeDraft, toEmail?: string): string {
  const params = new URLSearchParams({
    su: draft.subject,
    body: draft.body,
  });

  if (toEmail) {
    params.set("to", toEmail);
  }

  return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
}

function buildSignature(userName: string): string {
  return `Yours faithfully,\n\n${userName}\nProperty Manager\nFretwell & Co`;
}

export function buildTenancyNoticeDraft({
  noticeType,
  tenancy,
  userName,
  proposedRent,
}: {
  noticeType: TenancyNoticeType;
  tenancy: Tenancy;
  userName: string;
  proposedRent?: number;
}): TenancyNoticeDraft {
  const tenant = tenancy.tenant_names;
  const address = tenancy.property_address;
  const endDate = formatTenancyDate(tenancy.end_date);
  const currentRent = formatCurrency(Number(tenancy.monthly_rent));
  const signature = buildSignature(userName);

  switch (noticeType) {
    case "renewal_offer":
      return {
        subject: `Tenancy Renewal Offer — ${address}`,
        body: `Dear ${tenant},

We are writing in connection with your tenancy of ${address}.

Your current fixed-term tenancy is due to expire on ${endDate}. We are pleased to offer you a renewal of your tenancy on the following terms:

• Property: ${address}
• Proposed monthly rent: ${proposedRent ? formatCurrency(proposedRent) : currentRent}
• Proposed term: 12 months (Assured Shorthold Tenancy)

Please confirm your acceptance of this offer in writing within 14 days of the date of this letter. If you do not wish to renew, please notify us as soon as possible so that we may make appropriate arrangements.

This letter does not constitute a binding agreement until a new tenancy agreement has been signed by all parties.

${signature}`,
      };

    case "rent_increase":
      return {
        subject: `Section 13 Notice — Rent Increase — ${address}`,
        body: `Dear ${tenant},

NOTICE OF RENT INCREASE UNDER SECTION 13 OF THE HOUSING ACT 1988

We are writing to give you formal notice of a proposed increase in the rent payable for the dwelling at:

${address}

Current monthly rent: ${currentRent}
Proposed monthly rent: ${proposedRent ? formatCurrency(proposedRent) : "[Proposed rent]"}
Proposed date from which the increased rent is payable: [Date — minimum one month from service]

This notice is given in accordance with Section 13 of the Housing Act 1988. The proposed increase will take effect from the date specified above, being not less than one month after the date of service of this notice.

If you wish to challenge this notice, you may apply to the First-tier Tribunal (Property Chamber) before the proposed effective date.

${signature}`,
      };

    case "end_of_tenancy":
      return {
        subject: `End of Tenancy Notice — ${address}`,
        body: `Dear ${tenant},

We are writing to confirm that your tenancy of ${address} will end on ${endDate}, in accordance with the terms of your tenancy agreement.

Please ensure that you:

• Vacate the property on or before ${endDate}
• Return all keys to the property
• Leave the property in a clean and tidy condition, fair wear and tear excepted
• Provide a forwarding address for correspondence

A check-out inspection will be arranged prior to your departure. Your deposit will be returned in accordance with the terms of your tenancy agreement and the relevant deposit protection scheme, subject to any lawful deductions.

We thank you for your tenancy and wish you well.

${signature}`,
      };

    case "right_to_rent_reminder":
      return {
        subject: `Right to Rent — Documentation Reminder — ${address}`,
        body: `Dear ${tenant},

We are writing regarding your right to rent in the United Kingdom in connection with your tenancy of ${address}.

Our records indicate that your right to rent documentation${
          tenancy.right_to_rent_expiry
            ? ` expires on ${formatTenancyDate(tenancy.right_to_rent_expiry)}`
            : " requires renewal or verification"
        }.

Under the Immigration Act 2014, landlords in England are required to conduct right to rent checks before granting a tenancy and to conduct follow-up checks where a time-limited right to rent applies.

Please contact us within 14 days to arrange a convenient time to provide updated documentation. Failure to provide satisfactory evidence may affect your continued right to occupy the property.

${signature}`,
      };
  }
}
