/** Anthropic SDK error shape — avoid importing the SDK just for typing. */
type AnthropicLikeError = {
  status?: number;
  message?: string;
};

function isAnthropicApiError(error: unknown): error is AnthropicLikeError {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string; constructor?: { name?: string } }).name
    ?? (error as { constructor?: { name?: string } }).constructor?.name;
  return (
    name === "APIError" ||
    name === "AuthenticationError" ||
    name === "RateLimitError" ||
    name === "NotFoundError" ||
    ("status" in error && typeof (error as AnthropicLikeError).status === "number")
  );
}

export function getAssistantApiErrorMessage(
  error: unknown,
  fallback = "Unable to complete this request. Please try again shortly."
): { message: string; status: number } {
  if (isAnthropicApiError(error)) {
    if (error.status === 401) {
      return {
        message:
          "Anthropic API authentication failed. Check that ANTHROPIC_API_KEY is valid.",
        status: 502,
      };
    }
    if (error.status === 429) {
      return {
        message: "AI service is busy. Please try again in a moment.",
        status: 429,
      };
    }
    if (error.status === 404) {
      return {
        message: "Anthropic model not found (claude-sonnet-4-6).",
        status: 502,
      };
    }
    return {
      message: error.message || "Anthropic API request failed.",
      status: 502,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 502 };
  }

  return { message: fallback, status: 502 };
}
