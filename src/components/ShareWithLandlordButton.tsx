"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPortalUrl } from "@/lib/share";
import { btnGoldClassName } from "@/lib/ui";

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

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this landlord portal link:", url);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        className={btnGoldClassName}
      >
        {loading
          ? "Generating..."
          : copied
            ? "Link Copied!"
            : "Share with Landlord"}
      </button>
      {shareToken && (
        <p className="max-w-xs break-all text-right text-xs text-mahogany-900/60">
          Portal link ready — click to copy again.
        </p>
      )}
      {error && (
        <p className="text-right text-xs text-urgent">{error}</p>
      )}
    </div>
  );
}
