"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  formatEmailForCopy,
  type ContractorEmailDraft,
} from "@/lib/contractor-email";

interface ContractorEmailDraftModalProps {
  open: boolean;
  onClose: () => void;
  draft: ContractorEmailDraft | null;
  certificateLabel: string;
  propertyAddress: string;
}

const secondaryActionClassName =
  "flex h-10 w-full items-center justify-center border border-leather/40 bg-transparent text-xs font-normal uppercase tracking-[0.1em] text-leather transition duration-200 hover:border-leather hover:text-text";

export default function ContractorEmailDraftModal({
  open,
  onClose,
  draft: initialDraft,
  certificateLabel,
  propertyAddress,
}: ContractorEmailDraftModalProps) {
  const { success, error: toastError } = useToast();
  const [body, setBody] = useState(initialDraft?.body ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBody(initialDraft?.body ?? "");
    setCopied(false);
  }, [initialDraft]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const draft = useMemo(
    () => (initialDraft ? { ...initialDraft, body } : null),
    [initialDraft, body]
  );

  async function handleCopy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(formatEmailForCopy(draft));
      setCopied(true);
      success("Email copied to clipboard");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      toastError("Unable to copy email.");
    }
  }

  if (!open || !draft) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-email-title"
        className="assistant-composer-modal relative z-[1] flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[20px] bg-dune shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:rounded-[20px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 text-xl font-light leading-none text-gold-readable transition hover:text-gold"
        >
          ×
        </button>

        <div className="overflow-y-auto px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-raspberry">
            Draft Email
          </p>
          <h2
            id="draft-email-title"
            className="mt-2 pr-8 font-serif text-2xl tracking-wide text-heading"
          >
            {certificateLabel}
          </h2>
          <p className="mt-1 text-sm text-leather">{propertyAddress}</p>

          <div className="email-composition mt-6 overflow-hidden border border-taupe bg-vanilla">
            <div className="border-b border-leather/20 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                <span className="text-leather">To:</span>
                <span className="text-text">
                  {draft.toName}{" "}
                  <span className="text-leather/80">&lt;{draft.toEmail}&gt;</span>
                </span>
              </div>
            </div>
            <div className="border-b border-leather/20 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                <span className="text-leather">Subject:</span>
                <span className="text-text">{draft.subject}</span>
              </div>
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={14}
              spellCheck
              className="email-composition-body block w-full cursor-text resize-none border-0 bg-transparent px-4 py-5 font-sans text-[15px] leading-[1.75] text-text outline-none focus:ring-0 sm:px-5"
              aria-label="Email body"
            />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-leather/80">
            This is a draft only — no email is sent from Fretwell &amp; Co. Copy or
            open in your mail app, then send from your own account.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={handleCopy} className={secondaryActionClassName}>
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={buildGmailComposeUrl(draft)}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryActionClassName}
            >
              Open in Gmail
            </a>
            <a href={buildMailtoUrl(draft)} className={secondaryActionClassName}>
              Open in Mail
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
