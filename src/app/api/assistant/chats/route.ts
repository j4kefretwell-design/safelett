import { NextResponse } from "next/server";
import {
  type AssistantChatKind,
  type AssistantChatMessage,
  truncateChatTitle,
} from "@/lib/assistant-chats";
import { createClient } from "@/lib/supabase/server";

const VALID_KINDS: AssistantChatKind[] = [
  "ask",
  "draft",
  "compliance",
  "tenancy",
  "property",
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("assistant_chats")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("[api/assistant/chats] list failed:", error);
    return NextResponse.json(
      { error: "Unable to load saved chats." },
      { status: 500 }
    );
  }

  return NextResponse.json({ chats: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: {
    id?: string;
    kind?: string;
    title?: string;
    messages?: AssistantChatMessage[];
    metadata?: Record<string, unknown>;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!payload.kind || !VALID_KINDS.includes(payload.kind as AssistantChatKind)) {
    return NextResponse.json({ error: "Invalid chat kind." }, { status: 400 });
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Nothing to save yet." },
      { status: 400 }
    );
  }

  const firstUser = messages.find(
    (message) => message.role === "user" && message.content.trim()
  );
  const title = truncateChatTitle(
    payload.title?.trim() ||
      firstUser?.content ||
      (payload.kind === "draft" ? "Draft session" : "Saved chat")
  );

  const row = {
    user_id: user.id,
    kind: payload.kind,
    title,
    messages,
    metadata: payload.metadata ?? {},
    updated_at: new Date().toISOString(),
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from("assistant_chats")
      .update(row)
      .eq("id", payload.id)
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[api/assistant/chats] update failed:", error);
      return NextResponse.json(
        { error: "Unable to save chat." },
        { status: 500 }
      );
    }

    if (data) {
      return NextResponse.json({ chat: data });
    }
  }

  const { data, error } = await supabase
    .from("assistant_chats")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[api/assistant/chats] insert failed:", error);
    return NextResponse.json(
      { error: "Unable to save chat. Ensure the assistant_chats table exists." },
      { status: 500 }
    );
  }

  return NextResponse.json({ chat: data });
}
