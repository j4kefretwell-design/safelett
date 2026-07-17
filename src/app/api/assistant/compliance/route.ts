import { NextResponse } from "next/server";
import { createAnthropicClient } from "@/lib/anthropic";
import { ASSISTANT_MODEL, buildAssistantSystemPrompt } from "@/lib/assistant";
import { getAssistantApiErrorMessage } from "@/lib/assistant-api";
import {
  buildAssistantInsights,
  formatInsightsForCompliancePrompt,
} from "@/lib/assistant-insights";
import { createClient } from "@/lib/supabase/server";
import {
  consumeFeatureUsage,
  usageLimitResponse,
} from "@/lib/usage-limits";
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

    const system = `${buildAssistantSystemPrompt(portfolioFacts)}

Session focus: Portfolio compliance check. Using only the factual portfolio data provided, produce a clean compliance status summary. Identify overdue certificates, items expiring soon, and missing core certificates. Be accurate and concise. Do not give legal advice or compliance judgements beyond stating what the data shows. Present the summary as clean labelled sections with blank lines between them. End with a one-line reminder that this is an information summary only, not legal advice.`;

    const usage = await consumeFeatureUsage(supabase, "assistant_question");
    if (!usage.allowed && usage.code) {
      return NextResponse.json(usageLimitResponse(usage.code), { status: 429 });
    }

    const anthropic = await createAnthropicClient();

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
