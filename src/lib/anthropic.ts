/** Lazy-load Anthropic only when an AI route is hit — keeps it off the client and cold paths. */
export async function createAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new Error("API key not configured");
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  return new Anthropic({ apiKey: key });
}
