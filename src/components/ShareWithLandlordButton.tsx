"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPortalUrl } from "@/lib/share";
import { btnGoldClassName, inlineCancelLinkClassName } from "@/lib/ui";

interface ShareWithLandlordButtonProps {
  propertyId: string;
  shareToken: string | null;
}

export default function ShareWithLandlordButton({
  propertyId,
  shareToken: initialShareToken,
}: ShareWithLandlordButtonProps) {
  const router = useRouter();
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!panelOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPanelOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  async function ensureShareToken(): Promise<string | null> {
    if (shareToken) {
      return shareToken;
    }

    const supabase = createClient();
    const token = crypto.randomUUID();

    const { error: updateError } = await supabase
      .from("properties")
      .update({ share_token: token })
      .eq("id", propertyId);

    if (updateError) {
      setError(updateError.message);
      return null;
    }

    setShareToken(token);
    router.refresh();
    return token;
  }

  async function handleShare() {
    setError(null);
    setLoading(true);

    const token = await ensureShareToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const url = getPortalUrl(token);
    setPanelOpen(true);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* panel still shows the link for manual copy */
    }

    setLoading(false);
  }

  async function handleCopyAgain() {
    if (!shareToken) return;
    try {
      await navigator.clipboard.writeText(getPortalUrl(shareToken));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Unable to copy link. Please copy it manually.");
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={loading}
        className={btnGoldClassName}
      >
        {loading
          ? "Generating..."
          : copied
            ? "Link Copied!"
            : "Share with Landlord"}
      </button>
      {error && (
        <p className="text-right text-xs text-urgent">{error}</p>
      )}

      {panelOpen && shareToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setPanelOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-link-title"
            className="assistant-composer-modal relative z-[1] w-[90%] max-w-md rounded-[20px] bg-dune p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-10"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setPanelOpen(false)}
              className="absolute right-5 top-5 text-xl font-light leading-none text-gold-readable transition hover:text-gold"
            >
              ×
            </button>

            <h2
              id="share-link-title"
              className="pr-8 font-serif text-2xl tracking-wide text-study"
            >
              Landlord portal link
            </h2>
            <p className="mt-4 break-all text-sm font-light leading-relaxed text-cocoa">
              {getPortalUrl(shareToken)}
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => void handleCopyAgain()}
                className="flex h-11 w-full items-center justify-center bg-study text-sm uppercase tracking-[0.12em] text-parchment-line transition hover:bg-olive"
              >
                {copied ? "Copied" : "Copy Link"}
              </button>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className={`${inlineCancelLinkClassName} text-center`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
