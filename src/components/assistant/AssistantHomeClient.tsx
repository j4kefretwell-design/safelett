"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ASSISTANT_DISCLAIMER } from "@/lib/assistant";
import {
  readAssistantHistory,
  type AssistantHistoryEntry,
} from "@/lib/assistant-history";
import type { SmartSuggestion } from "@/lib/assistant-insights";

interface AssistantHomeClientProps {
  suggestions: SmartSuggestion[];
}

const quickActions = [
  { label: "Draft a Letter", href: "/assistant/draft" },
  { label: "Ask a Question", href: "/assistant/ask" },
  { label: "Expiring This Month", href: "/assistant/expiry" },
  { label: "Compliance Check", href: "/assistant/compliance" },
] as const;

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AssistantHomeClient({
  suggestions,
}: AssistantHomeClientProps) {
  const [history, setHistory] = useState<AssistantHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readAssistantHistory());

    function refresh() {
      setHistory(readAssistantHistory());
    }

    window.addEventListener("focus", refresh);
    window.addEventListener("fretwell-assistant-history", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("fretwell-assistant-history", refresh);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-greige">
      <div className="bg-forest px-5 py-8 sm:px-12 lg:px-16">
        <p className="text-[11px] font-normal uppercase tracking-[0.22em] text-dusty-cream/90">
          AI Assistant
        </p>
        <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-dusty-cream/85">
          Draft correspondence, ask about your portfolio, and review compliance
          using your live property data.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-12 sm:py-16 lg:px-0">
        <div className="grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="border-t border-gold/45 border-l-[3px] border-l-transparent px-4 py-5 text-left transition-colors duration-300 hover:border-l-forest hover:bg-[rgba(26,46,26,0.04)]"
            >
              <span className="font-serif text-lg tracking-wide text-text">
                {action.label}
              </span>
              <span className="mt-1 block text-sm text-forest">→</span>
            </Link>
          ))}
        </div>

        <section className="mt-16">
          <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-forest">
            Smart Suggestions
          </p>
          <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />

          {suggestions.length === 0 ? (
            <p className="mt-8 text-sm font-light italic leading-relaxed text-[#97795D]">
              No urgent suggestions right now. Your portfolio looks quiet this
              month.
            </p>
          ) : (
            <ul className="mt-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <Link
                    href={suggestion.href}
                    className="group flex w-full items-start gap-4 border-t border-gold/35 border-l-[3px] border-l-transparent py-6 text-left transition-colors duration-300 hover:border-l-forest hover:bg-[rgba(26,46,26,0.04)]"
                  >
                    <span className="flex-1 text-sm font-light leading-relaxed text-text sm:text-base">
                      {suggestion.text}
                    </span>
                    <span
                      className="shrink-0 pt-0.5 text-forest transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-16">
          <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-forest">
            Document History
          </p>
          <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />

          {history.length === 0 ? (
            <p className="mt-8 text-sm font-light italic leading-relaxed text-[#97795D]">
              Drafts from this session will appear here. History clears when your
              browser session ends.
            </p>
          ) : (
            <ul className="mt-2">
              {history.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/assistant/draft?history=${entry.id}`}
                    className="group flex w-full items-baseline justify-between gap-4 border-t border-gold/35 border-l-[3px] border-l-transparent py-5 transition-colors duration-300 hover:border-l-forest hover:bg-[rgba(26,46,26,0.04)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-lg tracking-wide text-text">
                        {entry.title}
                      </span>
                      <span className="mt-1 block text-xs font-light uppercase tracking-[0.12em] text-cocoa">
                        {entry.documentName}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-light text-[#97795D]">
                      {formatTimestamp(entry.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mx-auto mt-20 max-w-2xl text-center text-[11px] italic leading-relaxed text-[#97795D]">
          {ASSISTANT_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
