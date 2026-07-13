"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ASSISTANT_DISCLAIMER } from "@/lib/assistant";

interface ComplianceCounts {
  overdue: number;
  expiringThisMonth: number;
  missing: number;
  compliant: number;
  totalProperties: number;
}

export default function AssistantComplianceClient() {
  const [summary, setSummary] = useState<string | null>(null);
  const [counts, setCounts] = useState<ComplianceCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runCheck() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/assistant/compliance", {
          method: "POST",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to run compliance check.");
        }

        if (!cancelled) {
          setSummary(data.summary as string);
          setCounts(data.counts as ComplianceCounts);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to run compliance check."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void runCheck();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-greige">
      <div className="bg-forest px-5 py-8 sm:px-12 lg:px-16">
        <p className="text-[11px] font-normal uppercase tracking-[0.22em] text-dusty-cream/90">
          Compliance Check
        </p>
        <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-dusty-cream/85">
          A factual summary of overdue, expiring and missing items across your
          portfolio.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-12 sm:py-16 lg:px-0">
        <Link
          href="/assistant"
          className="text-sm font-light text-cocoa transition hover:text-text"
        >
          ← Assistant home
        </Link>

        {counts && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Overdue", value: counts.overdue },
              { label: "Expiring", value: counts.expiringThisMonth },
              { label: "Missing", value: counts.missing },
              {
                label: "Compliant",
                value: `${counts.compliant}/${counts.totalProperties}`,
              },
            ].map((stat) => (
              <div key={stat.label} className="border-t border-gold/45 pt-3">
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-forest">
                  {stat.label}
                </p>
                <p className="mt-2 font-serif text-2xl tracking-wide text-text">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-forest">
            Portfolio Status
          </p>
          <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />

          {loading && (
            <p className="mt-8 text-sm font-light italic text-[#97795D]">
              Reviewing your properties and certificates…
            </p>
          )}

          {error && (
            <div className="mt-8 space-y-4">
              <p className="text-sm leading-relaxed text-urgent">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-forest px-5 py-2.5 text-xs font-normal uppercase tracking-[0.14em] text-dusty-cream transition hover:bg-forest-dark"
              >
                Try again
              </button>
            </div>
          )}

          {summary && !loading && (
            <div className="mt-8 whitespace-pre-wrap text-sm font-light leading-relaxed text-text">
              {summary}
            </div>
          )}
        </div>

        <p className="mx-auto mt-20 max-w-2xl text-center text-[11px] italic leading-relaxed text-[#97795D]">
          {ASSISTANT_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
