export const ASSISTANT_MODEL = "claude-sonnet-4-6";

export const ASSISTANT_PLAIN_TEXT_FORMAT =
  "Format all responses in clean plain text. No markdown, no asterisks, no bullet symbols. Use numbered lists only when listing multiple items. Write as a knowledgeable colleague would speak.";

export const ASSISTANT_DISCLAIMER =
  "Fretwell & Co AI Assistant is a drafting and information tool only. It does not constitute legal advice. Always verify documents and compliance requirements with a qualified professional. Fretwell & Co accepts no liability for decisions made based on AI-generated content.";

export const DOCUMENT_DISCLAIMER =
  "IMPORTANT: This document has been drafted by Fretwell & Co AI Assistant for your review. Please verify all details are correct and consider seeking professional legal advice before serving any formal notices.";

/** Main system prompt for assistant conversations — portfolio expert + property management generalist. */
export function buildAssistantSystemPrompt(portfolioData: string): string {
  return `You are a professional property management assistant for a UK letting agent using Fretwell & Co. You have two roles:

Portfolio expert — you have access to the user's live portfolio data (properties, certificates, tenancies) and can answer specific questions about it accurately.
Property management generalist — you can help with any property management admin task including:

Drafting professional correspondence: letters to councils, mortgage lenders, insurance companies, neighbours, contractors
Preparing for difficult client or tenant conversations
Drafting contractor dispute letters or formal complaints
Writing monthly client portfolio update emails
Explaining property legislation and procedures in plain English (always clarifying this is general information not legal advice)
Drafting HMO licence application cover letters
Writing responses to council or local authority queries
General property management Q&A

Always be helpful, accurate and professional. Use formal British English. Never give definitive legal advice — for legal questions explain the general position and recommend consulting a qualified solicitor or letting agent professional body (ARLA/Propertymark).
${ASSISTANT_PLAIN_TEXT_FORMAT}
Portfolio data: ${portfolioData}`;
}

export type AssistantDocumentType =
  | "letter_to_tenant"
  | "rent_increase"
  | "end_of_tenancy"
  | "renewal_offer"
  | "maintenance_access"
  | "deposit_return"
  | "right_to_rent_reminder"
  | "late_rent";

export interface AssistantDocumentDefinition {
  id: AssistantDocumentType;
  name: string;
  description: string;
  requiresTenancy: boolean;
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "number" | "date" | "textarea";
    required?: boolean;
    placeholder?: string;
  }>;
}

export const ASSISTANT_DOCUMENTS: AssistantDocumentDefinition[] = [
  {
    id: "letter_to_tenant",
    name: "Letter to Tenant",
    description: "General correspondence",
    requiresTenancy: true,
    fields: [
      {
        id: "topic",
        label: "Subject / topic",
        type: "text",
        required: true,
        placeholder: "e.g. Garden maintenance",
      },
      {
        id: "notes",
        label: "Key points to include",
        type: "textarea",
        placeholder: "Any specific details for the letter",
      },
    ],
  },
  {
    id: "rent_increase",
    name: "Rent Increase Notice (Section 13)",
    description: "Formal rent increase",
    requiresTenancy: true,
    fields: [
      {
        id: "new_rent",
        label: "New monthly rent (£)",
        type: "number",
        required: true,
      },
      {
        id: "effective_date",
        label: "Effective date",
        type: "date",
        required: true,
      },
    ],
  },
  {
    id: "end_of_tenancy",
    name: "End of Tenancy Notice",
    description: "Notification of tenancy ending",
    requiresTenancy: true,
    fields: [
      {
        id: "vacate_date",
        label: "Vacate by date",
        type: "date",
        required: true,
      },
      {
        id: "notes",
        label: "Additional notes",
        type: "textarea",
      },
    ],
  },
  {
    id: "renewal_offer",
    name: "Tenancy Renewal Offer",
    description: "Offering renewal terms",
    requiresTenancy: true,
    fields: [
      {
        id: "new_rent",
        label: "Proposed monthly rent (£)",
        type: "number",
        required: true,
      },
      {
        id: "new_end_date",
        label: "Proposed new end date",
        type: "date",
        required: true,
      },
      {
        id: "notes",
        label: "Additional terms",
        type: "textarea",
      },
    ],
  },
  {
    id: "maintenance_access",
    name: "Maintenance Access Letter",
    description: "Requesting access for repairs",
    requiresTenancy: true,
    fields: [
      {
        id: "access_date",
        label: "Proposed access date",
        type: "date",
        required: true,
      },
      {
        id: "access_time",
        label: "Proposed access time",
        type: "text",
        required: true,
        placeholder: "e.g. 10:00–12:00",
      },
      {
        id: "work_description",
        label: "Work description",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "deposit_return",
    name: "Deposit Return Letter",
    description: "Confirming deposit return details",
    requiresTenancy: true,
    fields: [
      {
        id: "return_amount",
        label: "Amount to return (£)",
        type: "number",
        required: true,
      },
      {
        id: "deductions",
        label: "Proposed deductions",
        type: "textarea",
        placeholder: "Leave blank if none",
      },
      {
        id: "return_date",
        label: "Proposed return date",
        type: "date",
        required: true,
      },
    ],
  },
  {
    id: "right_to_rent_reminder",
    name: "Right to Rent Reminder",
    description: "Reminding tenant to provide documents",
    requiresTenancy: true,
    fields: [
      {
        id: "deadline_date",
        label: "Response deadline",
        type: "date",
        required: true,
      },
      {
        id: "documents_needed",
        label: "Documents required",
        type: "textarea",
        required: true,
        placeholder: "e.g. Passport and share code",
      },
    ],
  },
  {
    id: "late_rent",
    name: "Late Rent Notice",
    description: "Chasing overdue rent payment",
    requiresTenancy: true,
    fields: [
      {
        id: "amount_owed",
        label: "Amount owed (£)",
        type: "number",
        required: true,
      },
      {
        id: "period",
        label: "Period overdue",
        type: "text",
        required: true,
        placeholder: "e.g. March 2026",
      },
      {
        id: "deadline_date",
        label: "Payment deadline",
        type: "date",
        required: true,
      },
    ],
  },
];

export function getAssistantDocument(id: string) {
  return ASSISTANT_DOCUMENTS.find((document) => document.id === id) ?? null;
}

export const EXAMPLE_PORTFOLIO_QUESTIONS = [
  "Which certificates expire this month?",
  "Any unprotected deposits?",
  "Tenancies due for renewal?",
  "Which properties are fully compliant?",
] as const;
