"use client";

import { useCallback, useEffect, useState } from "react";
import { btnGoldClassName } from "@/lib/ui";
import type { ComplianceNewsItem } from "@/lib/compliance-news";

type NewsTab = "compliance" | "tenancy";

interface NewsResponse {
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

function NewsLoadingPlaceholder({ accent }: { accent: "burgundy" | "navy" }) {
  const bar = accent === "navy" ? "bg-navy/20" : "bg-gold/30";
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="skeleton-shimmer border border-leather/15 px-6 py-8 sm:px-8"
        >
          <div className={`h-3 w-24 ${bar}`} />
          <div className="mt-5 h-6 w-3/4 bg-leather/10" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full bg-leather/10" />
            <div className="h-3 w-full bg-leather/10" />
            <div className="h-3 w-2/3 bg-leather/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsFeedClient() {
  const [tab, setTab] = useState<NewsTab>("compliance");
  const [items, setItems] = useState<ComplianceNewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = tab === "compliance" ? "/api/news" : "/api/tenancy-news";
  const accent = tab === "compliance" ? "burgundy" : "navy";
  const headlineClass =
    tab === "compliance" ? "text-raspberry" : "text-navy";

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint);
      const data = (await response.json()) as NewsResponse & {
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
  }, [endpoint]);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  return (
    <>
      <section
        className={`flex flex-col items-center justify-center px-5 py-10 text-center ${
          tab === "tenancy" ? "bg-navy" : "dashboard-portfolio-divider"
        }`}
      >
        <p className="caps-label text-dusty-cream">
          {tab === "compliance" ? "Compliance News" : "Tenancy Law"}
        </p>
        <p className="mt-3 text-base italic leading-relaxed text-dusty-cream/90">
          {tab === "compliance"
            ? "Latest UK landlord legislation and regulatory updates"
            : "Recent UK tenancy law and lettings regulation updates"}
        </p>
      </section>

      <section className="px-5 py-10 sm:px-12 sm:py-12 lg:px-16">
        <div className="flex flex-wrap gap-6 border-b border-taupe pb-4">
          {(
            [
              ["compliance", "Compliance"],
              ["tenancy", "Tenancy Law"],
            ] as const
          ).map(([key, label]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`text-[10px] font-normal uppercase tracking-[0.22em] transition ${
                  active
                    ? key === "tenancy"
                      ? "text-navy"
                      : "text-raspberry"
                    : "text-taupe hover:text-umber"
                }`}
              >
                {label}
                {active ? (
                  <span
                    className={`mt-2 block h-px w-full ${
                      key === "tenancy" ? "bg-navy" : "bg-raspberry"
                    }`}
                    aria-hidden
                  />
                ) : (
                  <span className="mt-2 block h-px w-full bg-transparent" aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
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
            <NewsLoadingPlaceholder accent={accent} />
          ) : error ? (
            <div className="border border-taupe bg-dune px-8 py-14 text-center">
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
                  key={`${tab}-${item.headline}-${index}`}
                  className={`border border-leather/15 border-l-[3px] px-6 py-8 sm:px-8 ${
                    tab === "tenancy" ? "border-l-navy" : "border-l-raspberry"
                  } ${index % 2 === 0 ? "bg-dusty-cream" : "bg-beige"}`}
                >
                  <p className="caps-label text-gold-readable">{item.date}</p>
                  <h2
                    className={`mt-4 font-serif text-2xl tracking-wide ${headlineClass}`}
                  >
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
    </>
  );
}
