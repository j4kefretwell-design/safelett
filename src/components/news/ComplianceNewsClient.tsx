"use client";

import { useCallback, useEffect, useState } from "react";
import { btnGoldClassName } from "@/lib/ui";
import type { ComplianceNewsItem } from "@/lib/compliance-news";

interface ComplianceNewsResponse {
  items: ComplianceNewsItem[];
  fetchedAt: string;
}

function formatLastUpdated(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NewsLoadingPlaceholder() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse border border-leather/15 bg-dusty-cream/60 px-6 py-8 sm:px-8"
        >
          <div className="h-3 w-24 rounded bg-gold/30" />
          <div className="mt-5 h-6 w-3/4 rounded bg-leather/15" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-leather/10" />
            <div className="h-3 w-full rounded bg-leather/10" />
            <div className="h-3 w-2/3 rounded bg-leather/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ComplianceNewsClient() {
  const [items, setItems] = useState<ComplianceNewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/news");
      const data = (await response.json()) as ComplianceNewsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ?? "Unable to load news at this time. Please try again shortly."
        );
      }

      setItems(data.items);
      setFetchedAt(data.fetchedAt);
    } catch (fetchError) {
      setItems([]);
      setFetchedAt(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load news at this time. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  return (
    <section className="px-5 py-10 sm:px-12 sm:py-12 lg:px-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {fetchedAt ? (
          <p className="text-sm leading-relaxed text-leather">
            Last updated: {formatLastUpdated(fetchedAt)}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-leather">
            Fetching the latest updates…
          </p>
        )}
        <button
          type="button"
          onClick={() => void fetchNews()}
          disabled={loading}
          className={`${btnGoldClassName} w-full border border-gold px-5 py-2.5 sm:w-auto`}
        >
          {loading ? "Refreshing…" : "Refresh News"}
        </button>
      </div>

      <div className="mt-10">
        {loading && items.length === 0 ? (
          <NewsLoadingPlaceholder />
        ) : error ? (
          <div className="border border-leather/20 bg-white px-8 py-14 text-center">
            <p className="text-base leading-relaxed text-leather">{error}</p>
            <button
              type="button"
              onClick={() => void fetchNews()}
              className={`${btnGoldClassName} mt-8 border border-gold px-5 py-2.5`}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item, index) => (
              <article
                key={`${item.headline}-${index}`}
                className={`border border-leather/15 px-6 py-8 sm:px-8 ${
                  index % 2 === 0 ? "bg-dusty-cream" : "bg-beige"
                }`}
              >
                <p className="caps-label text-gold-readable">{item.date}</p>
                <h2 className="mt-4 font-serif text-2xl tracking-wide text-raspberry">
                  {item.headline}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-text">
                  {item.summary}
                </p>
                <p className="mt-5 text-base leading-relaxed text-leather">
                  <span className="font-normal text-text">Why this matters:</span>{" "}
                  {item.relevance}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="mt-12 max-w-3xl text-sm italic leading-relaxed text-cocoa">
        This information is for general guidance only and does not constitute
        legal advice. Always verify regulatory requirements with a qualified
        professional. Fretwell &amp; Co accepts no responsibility for decisions
        made based on this content.
      </p>
    </section>
  );
}
