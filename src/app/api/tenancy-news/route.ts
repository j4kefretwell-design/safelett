import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  TENANCY_NEWS_MODEL,
  TENANCY_NEWS_SYSTEM_PROMPT,
  TENANCY_NEWS_USER_PROMPT,
  parseTenancyNewsResponse,
} from "@/lib/tenancy-news";
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
        message: `Anthropic model not found (${TENANCY_NEWS_MODEL}).`,
        status: 502,
      };
    }

    return {
      message: error.message || "Anthropic API request failed.",
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
      model: TENANCY_NEWS_MODEL,
      max_tokens: 4096,
      system: TENANCY_NEWS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: TENANCY_NEWS_USER_PROMPT,
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

    const items = parseTenancyNewsResponse(text);

    return NextResponse.json({
      items,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/tenancy-news] Tenancy news fetch failed:", error);
    const { message, status } = getApiErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
