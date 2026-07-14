import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  ASSISTANT_MODEL,
  buildAssistantSystemPrompt,
} from "@/lib/assistant";
import { getAssistantApiErrorMessage } from "@/lib/assistant-api";
import {
  buildPropertyReportContext,
  buildTenancyReviewContext,
} from "@/lib/assistant-entity-context";
import { buildPortfolioContext } from "@/lib/assistant-portfolio";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

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

  let payload: {
    message?: string;
    history?: ChatMessage[];
    mode?: "ask" | "tenancy" | "property";
    tenancyId?: string;
    propertyId?: string;
  };

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

  const mode = payload.mode ?? "ask";
  let system = "";

  try {
    if (mode === "tenancy") {
      if (!payload.tenancyId) {
        return NextResponse.json(
          { error: "Tenancy is required." },
          { status: 400 }
        );
      }

      const { data: tenancy, error } = await supabase
        .from("tenancies")
        .select("*")
        .eq("id", payload.tenancyId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !tenancy) {
        return NextResponse.json(
          { error: "Tenancy not found." },
          { status: 404 }
        );
      }

      const typed = tenancy as Tenancy;
      let property: Property | null = null;
      let certificates: Certificate[] = [];

      if (typed.property_id) {
        const { data: propertyRow } = await supabase
          .from("properties")
          .select("*")
          .eq("id", typed.property_id)
          .eq("user_id", user.id)
          .maybeSingle();
        property = (propertyRow as Property | null) ?? null;

        if (property) {
          const { data: certRows } = await supabase
            .from("certificates")
            .select("*")
            .eq("property_id", property.id);
          certificates = (certRows ?? []) as Certificate[];
        }
      }

      const context = buildTenancyReviewContext(typed, property, certificates);
      system = `${buildAssistantSystemPrompt(context)}

Session focus: Tenancy review. Prioritise key dates, deposit status, right to rent, upcoming actions and related correspondence for this tenancy. You may still help with general property management questions and drafting when asked.`;
    } else if (mode === "property") {
      if (!payload.propertyId) {
        return NextResponse.json(
          { error: "Property is required." },
          { status: 400 }
        );
      }

      const { data: property, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", payload.propertyId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !property) {
        return NextResponse.json(
          { error: "Property not found." },
          { status: 404 }
        );
      }

      const typedProperty = property as Property;
      const [{ data: certRows }, { data: tenancyRows }] = await Promise.all([
        supabase
          .from("certificates")
          .select("*")
          .eq("property_id", typedProperty.id),
        supabase
          .from("tenancies")
          .select("*")
          .eq("user_id", user.id),
      ]);

      const linkedTenancies = ((tenancyRows ?? []) as Tenancy[]).filter(
        (tenancy) =>
          tenancy.property_id === typedProperty.id ||
          tenancy.property_address.trim().toLowerCase() ===
            typedProperty.address.trim().toLowerCase()
      );

      const context = buildPropertyReportContext(
        typedProperty,
        (certRows ?? []) as Certificate[],
        linkedTenancies
      );
      system = `${buildAssistantSystemPrompt(context)}

Session focus: Property report. Prioritise a clear compliance and tenancy summary for this property, including overdue items, items needing attention soon, missing certificates and tenancy risks. You may still help with general property management questions and drafting when asked.`;
    } else {
      const portfolioData = await buildPortfolioContext(supabase, user.id);
      system = buildAssistantSystemPrompt(portfolioData);
    }

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
    const { message: errorMessage, status } = getAssistantApiErrorMessage(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
