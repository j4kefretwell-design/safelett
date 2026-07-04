import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  COMPLIANCE_NEWS_SYSTEM_PROMPT,
  parseComplianceNewsResponse,
} from "@/lib/compliance-news";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "News service is not configured." },
      { status: 503 }
    );
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: COMPLIANCE_NEWS_SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
          user_location: {
            type: "approximate",
            country: "GB",
            timezone: "Europe/London",
          },
        },
      ],
      messages: [
        {
          role: "user",
          content:
            "Use web search to find current UK landlord compliance news from the last 3 months. Return exactly 5 items as a JSON array with fields headline, summary, date, and relevance.",
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const items = parseComplianceNewsResponse(text);

    return NextResponse.json({
      items,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Compliance news fetch failed:", error);
    return NextResponse.json(
      { error: "Unable to load news at this time. Please try again shortly." },
      { status: 502 }
    );
  }
}
