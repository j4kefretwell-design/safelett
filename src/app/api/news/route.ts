import { NextResponse } from "next/server";
import { createAnthropicClient } from "@/lib/anthropic";
import { getAssistantApiErrorMessage } from "@/lib/assistant-api";
import {
  COMPLIANCE_NEWS_MODEL,
  COMPLIANCE_NEWS_SYSTEM_PROMPT,
  parseComplianceNewsResponse,
} from "@/lib/compliance-news";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const anthropic = await createAnthropicClient();

    const response = await anthropic.messages.create({
      model: COMPLIANCE_NEWS_MODEL,
      max_tokens: 4096,
      system: COMPLIANCE_NEWS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            "Provide exactly 5 UK landlord compliance topics for property managers in 2025-2026 as a JSON array with fields headline, summary, date, and relevance.",
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

    const items = parseComplianceNewsResponse(text);

    return NextResponse.json({
      items,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/news] Compliance news fetch failed:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "News response could not be parsed. Please try again." },
        { status: 502 }
      );
    }
    const { message, status } = getAssistantApiErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
