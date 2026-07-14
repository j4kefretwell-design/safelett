import {
  parseComplianceNewsResponse,
  type ComplianceNewsItem,
} from "@/lib/compliance-news";

export type TenancyNewsItem = ComplianceNewsItem;

export const TENANCY_NEWS_MODEL = "claude-sonnet-4-6";

export const TENANCY_NEWS_SYSTEM_PROMPT = `You are a UK property management specialist. Provide 5 recent and relevant UK tenancy law and lettings regulation updates from the last 3 months. Focus on: Renters Rights Act developments, deposit protection rules, eviction law changes, tenant fee regulations, HMO licensing changes, rent control proposals, Section 21 and Section 8 updates. For each item provide: headline, 2-3 sentence plain English summary, date context, why it matters to letting agents. Format as JSON array with fields: headline, summary, date, relevance. Return only the JSON array, no other text.`;

export const TENANCY_NEWS_USER_PROMPT =
  "Provide exactly 5 UK tenancy law and lettings regulation updates from the last 3 months as a JSON array with fields headline, summary, date, and relevance.";

export function parseTenancyNewsResponse(text: string): TenancyNewsItem[] {
  return parseComplianceNewsResponse(text);
}
