import { NextResponse } from "next/server";
import { createAnthropicClient } from "@/lib/anthropic";
import { getAssistantApiErrorMessage } from "@/lib/assistant-api";
import {
  TENANCY_NEWS_MODEL,
  TENANCY_NEWS_SYSTEM_PROMPT,
  TENANCY_NEWS_USER_PROMPT,
  parseTenancyNewsResponse,
} from "@/lib/tenancy-news";
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
    const { message, status } = getAssistantApiErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
