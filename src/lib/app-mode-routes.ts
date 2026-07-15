export type AppMode = "overview" | "compliance" | "tenancy" | "assistant";

export const MODE_HOME: Record<AppMode, string> = {
  overview: "/dashboard",
  compliance: "/compliance",
  tenancy: "/tenancy/dashboard",
  assistant: "/assistant",
};

export const MODE_PREFETCH_PATHS = [
  MODE_HOME.overview,
  MODE_HOME.compliance,
  MODE_HOME.tenancy,
  MODE_HOME.assistant,
] as const;
