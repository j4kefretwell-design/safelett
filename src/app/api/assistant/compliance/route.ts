import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ASSISTANT_MODEL } from "@/lib/assistant";
import { getAssistantApiErrorMessage } from "@/lib/assistant-api";
import {
  buildAssistantInsights,
  formatInsightsForCompliancePrompt,
} from "@/lib/assistant-insights";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export async function POST() {
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

  try {
    const [{ data: properties }, { data: tenancies }] = await Promise.all([
      supabase.from("properties").select("*").eq("user_id", user.id),
      supabase.from("tenancies").select("*").eq("user_id", user.id),
    ]);

    const propertyList = (properties ?? []) as Property[];
    const propertyIds = propertyList.map((property) => property.id);
    let certificates: Certificate[] = [];

    if (propertyIds.length > 0) {
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .in("property_id", propertyIds);
      certificates = (data ?? []) as Certificate[];
    }

    const insights = buildAssistantInsights({
      properties: propertyList,
      certificates,
      tenancies: (tenancies ?? []) as Tenancy[],
    });

    const portfolioFacts = formatInsightsForCompliancePrompt(insights);

    const system = `You are a professional property portfolio assistant for a UK property manager using Fretwell & Co. Using only the factual portfolio data provided, produce a clean compliance status summary. Identify overdue certificates, items expiring soon, and missing core certificates. Be accurate and concise. Do not give legal advice or compliance judgements beyond stating what the data shows. End with a one-line reminder that this is an information summary only, not legal advice. Portfolio data: ${portfolioFacts}`;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY.trim(),
    });

    const response = await anthropic.messages.create({
      model: ASSISTANT_MODEL,
      max_tokens: 2048,
      system,
      messages: [
        {
          role: "user",
          content:
            "Please produce the portfolio compliance check summary now, organised under clear headings.",
        },
      ],
    });

    const summary = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!summary) {
      throw new Error("Anthropic returned an empty response.");
    }

    return NextResponse.json({
      summary,
      counts: {
        overdue: insights.overdueCertificates.length,
        expiringThisMonth: insights.expiringThisMonth.length,
        missing: insights.missingCertificates.length,
        compliant: insights.compliantPropertyCount,
        totalProperties: insights.totalProperties,
      },
    });
  } catch (error) {
    console.error("[api/assistant/compliance] failed:", error);
    const { message, status } = getAssistantApiErrorMessage(
      error,
      "Unable to run compliance check right now. Please try again shortly."
    );
    return NextResponse.json({ error: message }, { status });
  }
}
