import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  COMPLIANCE_NEWS_MODEL,
  COMPLIANCE_NEWS_SYSTEM_PROMPT,
  parseComplianceNewsResponse,
} from "@/lib/compliance-news";
import { createClient } from "@/lib/supabase/server";

function getApiErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 401) {
      return {
        message:
          "Anthropic API authentication failed. Check that ANTHROPIC_API_KEY is valid.",
        status: 502,
      };
    }

    if (error.status === 429) {
      return {
        message: "News service is busy. Please try again in a moment.",
        status: 429,
      };
    }

    if (error.status === 404) {
      return {
        message: `Anthropic model not found (${COMPLIANCE_NEWS_MODEL}).`,
        status: 502,
      };
    }

    return {
      message: error.message || "Anthropic API request failed.",
      status: 502,
    };
  }

  if (error instanceof SyntaxError) {
    return {
      message: "News response could not be parsed. Please try again.",
      status: 502,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 502,
    };
  }

  return {
    message: "Unable to load news at this time. Please try again shortly.",
    status: 502,
  };
}

export async function GET() {
  console.log(
    "[api/news] ANTHROPIC_API_KEY configured:",
    Boolean(process.env.ANTHROPIC_API_KEY)
  );

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

  const apiKey = process.env.ANTHROPIC_API_KEY.trim();

  try {
    const anthropic = new Anthropic({ apiKey });

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
    const { message, status } = getApiErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
