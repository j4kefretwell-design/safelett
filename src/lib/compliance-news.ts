export interface ComplianceNewsItem {
  headline: string;
  summary: string;
  date: string;
  relevance: string;
}

export const COMPLIANCE_NEWS_SYSTEM_PROMPT = `You are a UK property compliance expert. Provide 5 important UK landlord compliance topics and regulatory requirements that property managers need to know about in 2025-2026. For each item provide a headline, a 2-3 sentence practical summary, a timeframe or date context, and why it matters to property managers. Format your response as a valid JSON array with fields: headline, summary, date, relevance. Return only the JSON array, no other text.`;

export const COMPLIANCE_NEWS_MODEL = "claude-sonnet-4-6";

export function parseComplianceNewsResponse(text: string): ComplianceNewsItem[] {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("News response did not contain a JSON array.");
  }

  const cleaned = jsonMatch[0]
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("News response was not valid JSON.");
  }

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
    throw new Error("No valid news items were returned.");
  }

  return items.slice(0, 5);
}
