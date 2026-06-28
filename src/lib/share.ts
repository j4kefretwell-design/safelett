export function getPortalUrl(shareToken: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "");

  return `${base.replace(/\/$/, "")}/portal/${shareToken}`;
}
