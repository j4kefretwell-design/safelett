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

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10 sm:px-12 sm:py-12 lg:px-0">
        <div className="flex min-h-[28rem] flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto pb-8">
            {messages.length === 0 && !loading && (
              <p className="text-sm font-light italic leading-relaxed text-[#97795D]/85">
                Ask a question about your portfolio, or choose an example below.
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "user" ? (
                  <div className="max-w-[80%] rounded-full bg-forest px-4 py-2 text-sm font-light leading-relaxed text-dusty-cream">
                    {message.content}
                  </div>
                ) : (
                  <div className="max-w-[90%] border-l-[2px] border-forest pl-4 text-sm font-light leading-relaxed whitespace-pre-wrap text-text">
                    {message.content}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="border-l-[2px] border-forest/40 pl-4 text-sm italic text-[#97795D]">
                  Reviewing your portfolio…
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="mt-auto space-y-5 border-t border-gold/30 pt-6">
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PORTFOLIO_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendQuestion(question)}
                  className="px-3 py-1.5 text-left text-[11px] font-light tracking-wide text-forest transition hover:bg-[rgba(26,46,26,0.06)] disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-4">
              <label htmlFor="assistant-ask-input" className="sr-only">
                Ask a question
              </label>
              <input
                id="assistant-ask-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your portfolio…"
                className="min-h-11 flex-1 border-0 border-b border-forest/30 bg-transparent px-0 py-2 text-base font-light leading-relaxed text-text outline-none placeholder:italic placeholder:text-[#97795D]/55 focus:border-b-2 focus:border-forest focus:pb-[calc(0.5rem-1px)]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 bg-forest px-5 py-2.5 text-xs font-normal uppercase tracking-[0.14em] text-dusty-cream transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ask →
              </button>
            </form>

            {error && (
              <p className="text-sm leading-relaxed text-urgent">{error}</p>
            )}
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-2xl text-center text-[11px] italic leading-relaxed text-[#97795D]">
          {ASSISTANT_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
