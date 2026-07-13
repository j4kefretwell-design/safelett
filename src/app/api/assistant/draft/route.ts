import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  ASSISTANT_MODEL,
  DOCUMENT_DISCLAIMER,
  getAssistantDocument,
  type AssistantDocumentType,
} from "@/lib/assistant";
import { getAssistantApiErrorMessage } from "@/lib/assistant-api";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/user-profile";
import { resolveUserDisplayName } from "@/lib/contractor-email";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";
import {
  DEPOSIT_SCHEME_LABELS,
  TENANCY_TYPE_LABELS,
} from "@/lib/tenancy";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";

function formatPropertyBlock(property: Property): string {
  return [
    `Address: ${property.address}`,
    `Type: ${PROPERTY_TYPE_LABELS[property.property_type] ?? property.property_type}`,
    `Bedrooms: ${property.bedrooms}`,
    property.notes ? `Notes: ${property.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatTenancyBlock(tenancy: Tenancy): string {
  return [
    `Tenants: ${tenancy.tenant_names}`,
    `Property address: ${tenancy.property_address}`,
    `Tenancy type: ${TENANCY_TYPE_LABELS[tenancy.tenancy_type] ?? tenancy.tenancy_type}`,
    `Start date: ${tenancy.start_date}`,
    `End date: ${tenancy.end_date}`,
    `Monthly rent: £${tenancy.monthly_rent}`,
    tenancy.rent_review_date
      ? `Rent review date: ${tenancy.rent_review_date}`
      : null,
    tenancy.deposit_amount != null
      ? `Deposit amount: £${tenancy.deposit_amount}`
      : null,
    tenancy.deposit_scheme
      ? `Deposit scheme: ${DEPOSIT_SCHEME_LABELS[tenancy.deposit_scheme]}`
      : null,
    tenancy.deposit_reference
      ? `Deposit reference: ${tenancy.deposit_reference}`
      : null,
    `Right to rent checked: ${tenancy.right_to_rent_checked ? "yes" : "no"}`,
    tenancy.right_to_rent_expiry
      ? `Right to rent expiry: ${tenancy.right_to_rent_expiry}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseDraftResponse(text: string): { subject: string; body: string } {
  const subjectMatch = text.match(/Subject:\s*(.+)/i);
  let subject = subjectMatch?.[1]?.trim() ?? "Property correspondence";
  let body = text.trim();

  if (subjectMatch) {
    body = text.replace(/Subject:\s*.+\n?/i, "").trim();
  }

  if (!body.includes(DOCUMENT_DISCLAIMER)) {
    body = `${body}\n\n${DOCUMENT_DISCLAIMER}`;
  }

  if (!subject) {
    subject = "Property correspondence";
  }

  return { subject, body };
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: {
    documentType?: string;
    propertyId?: string;
    tenancyId?: string | null;
    fields?: Record<string, string>;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const document = getAssistantDocument(payload.documentType ?? "");
  if (!document) {
    return NextResponse.json(
      { error: "Unknown document type." },
      { status: 400 }
    );
  }

  if (!payload.propertyId) {
    return NextResponse.json(
      { error: "Property is required." },
      { status: 400 }
    );
  }

  const fields = payload.fields ?? {};
  for (const field of document.fields) {
    if (field.required && !String(fields[field.id] ?? "").trim()) {
      return NextResponse.json(
        { error: `${field.label} is required.` },
        { status: 400 }
      );
    }
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", payload.propertyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (propertyError || !property) {
    return NextResponse.json(
      { error: "Property not found." },
      { status: 404 }
    );
  }

  let tenancy: Tenancy | null = null;
  if (payload.tenancyId) {
    const { data: tenancyRow, error: tenancyError } = await supabase
      .from("tenancies")
      .select("*")
      .eq("id", payload.tenancyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (tenancyError || !tenancyRow) {
      return NextResponse.json(
        { error: "Tenancy not found." },
        { status: 404 }
      );
    }

    tenancy = tenancyRow as Tenancy;
  } else if (document.requiresTenancy) {
    return NextResponse.json(
      { error: "Tenancy is required for this document." },
      { status: 400 }
    );
  }

  const profile = await getUserProfile(supabase, user.id);
  const signOffName = resolveUserDisplayName(profile.full_name);

  const fieldLines = document.fields
    .map((field) => {
      const value = String(fields[field.id] ?? "").trim();
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const contextParts = [
    formatPropertyBlock(property as Property),
    tenancy ? formatTenancyBlock(tenancy) : "No tenancy selected.",
    fieldLines ? `Additional details:\n${fieldLines}` : null,
    `Signer name: ${signOffName}`,
    `Agency: Fretwell & Co`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const system = `You are a professional property management assistant for a UK letting agency. Draft a ${document.name} letter for the following property and tenancy details: ${contextParts}. Use formal British English appropriate for professional property correspondence. The letter should be properly formatted with date, addresses, subject line, body paragraphs and sign-off. Begin the response with a single line "Subject: ..." then a blank line, then the full letter body. Place the date at the top right of the letter body, the recipient address block top left, an underlined subject line in the body, proper paragraphs, and a professional sign-off from ${signOffName} at Fretwell & Co. End every document with this disclaimer on a new line: '${DOCUMENT_DISCLAIMER}'`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY.trim(),
    });

    const response = await anthropic.messages.create({
      model: ASSISTANT_MODEL,
      max_tokens: 4096,
      system,
      messages: [
        {
          role: "user",
          content: `Please draft the ${document.name} now.`,
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Anthropic returned an empty response.");
    }

    const draft = parseDraftResponse(text);
    const documentType = document.id as AssistantDocumentType;

    return NextResponse.json({
      documentType,
      documentName: document.name,
      subject: draft.subject,
      body: draft.body,
      toEmail: null,
      propertyAddress: (property as Property).address,
      tenantNames: tenancy?.tenant_names ?? null,
    });
  } catch (error) {
    console.error("[api/assistant/draft] Draft failed:", error);
    const { message, status } = getAssistantApiErrorMessage(
      error,
      "Unable to draft document at this time. Please try again shortly."
    );
    return NextResponse.json({ error: message }, { status });
  }
}
