export interface ComplianceNewsItem {
  headline: string;
  summary: string;
  date: string;
  relevance: string;
}

export const COMPLIANCE_NEWS_SYSTEM_PROMPT = `You are a UK property compliance specialist. Search for and provide the 5 most recent and relevant UK landlord compliance news items, regulatory changes, or legislation updates from the last 3 months. For each item provide: a headline, a 2-3 sentence summary in plain English that a property manager would understand, the date or approximate timeframe, and why it matters to landlords. Format as JSON array with fields: headline, summary, date, relevance. Focus on: EPC regulations, electrical safety, gas safety, HMO licensing, tenant deposit rules, eviction law changes, fire safety requirements.

Return ONLY a valid JSON array. No markdown, no code fences, no commentary before or after the JSON.`;

export function parseComplianceNewsResponse(text: string): ComplianceNewsItem[] {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("News response was not an array.");
  }

  const items: ComplianceNewsItem[] = [];

  for (const entry of parsed) {
    if (
      typeof entry === "object" &&
      entry !== null &&
      "headline" in entry &&
      "summary" in entry &&
      "date" in entry &&
      "relevance" in entry &&
      typeof entry.headline === "string" &&
      typeof entry.summary === "string" &&
      typeof entry.date === "string" &&
      typeof entry.relevance === "string"
    ) {
      items.push({
        headline: entry.headline.trim(),
        summary: entry.summary.trim(),
        date: entry.date.trim(),
        relevance: entry.relevance.trim(),
      });
    }
  }

  if (items.length === 0) {
    throw new Error("No valid news items in response.");
  }

  return items.slice(0, 5);
}
