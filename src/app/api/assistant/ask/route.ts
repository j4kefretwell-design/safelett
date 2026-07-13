import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ASSISTANT_MODEL } from "@/lib/assistant";
import { buildPortfolioContext } from "@/lib/assistant-portfolio";
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
        message: "AI service is busy. Please try again in a moment.",
        status: 429,
      };
    }
    return {
      message: error.message || "Anthropic API request failed.",
      status: 502,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 502 };
  }

  return {
    message: "Unable to answer at this time. Please try again shortly.",
    status: 502,
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

  let payload: { message?: string; history?: ChatMessage[] };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = payload.message?.trim();
  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const history = (payload.history ?? [])
    .filter(
      (item) =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim()
    )
    .slice(-12)
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));

  const portfolioData = await buildPortfolioContext(supabase, user.id);

  const system = `You are a professional property portfolio assistant for a UK property manager using Fretwell & Co. You have access to their portfolio data below. Answer questions about their properties, tenancies and compliance certificates accurately and concisely. Do not give legal advice or definitive compliance judgements. For legal questions, recommend they consult a qualified professional. Always be helpful, accurate and professional. Portfolio data: ${portfolioData}`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY.trim(),
    });

    const response = await anthropic.messages.create({
      model: ASSISTANT_MODEL,
      max_tokens: 2048,
      system,
      messages: [
        ...history.map((item) => ({
          role: item.role,
          content: item.content,
        })),
        { role: "user" as const, content: message },
      ],
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!reply) {
      throw new Error("Anthropic returned an empty response.");
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[api/assistant/ask] Ask failed:", error);
    const { message: errorMessage, status } = getApiErrorMessage(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
