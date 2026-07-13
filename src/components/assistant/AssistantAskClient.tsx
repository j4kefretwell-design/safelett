"use client";

import { useEffect, useRef, useState } from "react";
import {
  ASSISTANT_DISCLAIMER,
  EXAMPLE_PORTFOLIO_QUESTIONS,
} from "@/lib/assistant";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantAskClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to get a response.");
      }

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply as string },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to get a response.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendQuestion(input);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col bg-greige">
      <div className="bg-forest px-5 py-8 sm:px-12 lg:px-16">
        <p className="text-[11px] font-normal uppercase tracking-[0.22em] text-dusty-cream/90">
          Portfolio Assistant
        </p>
        <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-dusty-cream/85">
          Ask questions about your properties, tenancies and compliance
          certificates.
        </p>
      </div>

      <div className="flex flex-1 flex-col px-5 py-8 sm:px-12 lg:px-16">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PORTFOLIO_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              disabled={loading}
              onClick={() => void sendQuestion(question)}
              className="border border-forest/25 bg-greige-alt px-3 py-2 text-left text-xs font-light leading-snug text-forest transition hover:border-forest/50 hover:bg-[#ebe4dc] disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="mt-8 flex min-h-[22rem] flex-1 flex-col overflow-hidden border border-forest/15 bg-greige-alt/40">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length === 0 && !loading && (
              <p className="text-sm font-light italic leading-relaxed text-cocoa/80">
                Ask a question about your portfolio, or choose an example above.
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-forest text-dusty-cream"
                      : "bg-greige-alt text-text"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-greige-alt px-4 py-3 text-sm italic text-cocoa">
                  Reviewing your portfolio…
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-3 border-t border-forest/15 bg-greige px-4 py-4 sm:px-6"
          >
            <label htmlFor="assistant-ask-input" className="sr-only">
              Ask a question
            </label>
            <textarea
              id="assistant-ask-input"
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about properties, tenancies or certificates…"
              className="min-h-[2.75rem] flex-1 resize-none border-0 border-b border-forest/25 bg-transparent px-0 py-2 text-base font-light leading-relaxed text-text outline-none placeholder:italic placeholder:text-cocoa/50 focus:border-b-2 focus:border-forest focus:pb-[calc(0.5rem-1px)]"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendQuestion(input);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 bg-forest px-5 py-3 text-xs font-normal uppercase tracking-[0.14em] text-dusty-cream transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>

        {error && (
          <p className="mt-4 text-sm leading-relaxed text-urgent">{error}</p>
        )}

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs italic leading-relaxed text-cocoa">
          {ASSISTANT_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
