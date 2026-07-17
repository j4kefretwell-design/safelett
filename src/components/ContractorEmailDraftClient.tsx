"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  formatEmailForCopy,
  type ContractorEmailDraft,
} from "@/lib/contractor-email";
import {
  capsLabelClassName,
  editorialFormSubmitClassName,
  pageBackLinkClassName,
} from "@/lib/ui";

interface ContractorEmailDraftClientProps {
  draft: ContractorEmailDraft;
  certificateLabel: string;
  propertyAddress: string;
  backHref: string;
}

const secondaryActionClassName =
  "flex h-10 w-full items-center justify-center border border-leather/40 bg-transparent text-xs font-normal uppercase tracking-[0.1em] text-leather transition duration-200 hover:border-leather hover:text-text";

export default function ContractorEmailDraftClient({
  draft: initialDraft,
  certificateLabel,
  propertyAddress,
  backHref,
}: ContractorEmailDraftClientProps) {
  const { success, error: toastError } = useToast();
  const [body, setBody] = useState(initialDraft.body);
  const [copied, setCopied] = useState(false);

  const draft = useMemo(
    () => ({
      ...initialDraft,
      body,
    }),
    [initialDraft, body]
  );

  async function handleCopy() {
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

  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden px-5 py-10 sm:px-12 sm:py-14 lg:px-16">
      <Link href={backHref} className={pageBackLinkClassName}>
        ← Back to Property
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className={capsLabelClassName}>Contractor Email Draft</p>
        <h1 className="mt-3 font-serif text-2xl tracking-wide text-heading sm:text-3xl">
          {certificateLabel}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-leather">{propertyAddress}</p>
      </header>

      <div className="email-composition mt-10 max-w-3xl">
        <div className="border-b border-leather/25 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="shrink-0 text-sm font-normal text-leather">To:</span>
            <span className="text-base leading-relaxed text-text">
              {draft.toName}{" "}
              <span className="text-leather/80">&lt;{draft.toEmail}&gt;</span>
            </span>
          </div>
        </div>

        <div className="border-b border-leather px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="shrink-0 text-sm font-normal text-leather">
              Subject:
            </span>
            <span className="text-base leading-relaxed text-text">
              {draft.subject}
            </span>
          </div>
        </div>

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={18}
          spellCheck
          className="email-composition-body block w-full cursor-text resize-none border-0 bg-transparent px-5 py-6 font-sans text-[15px] leading-[1.75] text-text outline-none focus:ring-0 sm:px-6 sm:py-8"
          aria-label="Email body"
        />
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-leather/80">
        This is a draft only — no email is sent from Fretwell &amp; Co. Copy or
        open in your mail app, then send from your own account.
      </p>

      <div className="mt-8 max-w-3xl space-y-3">
        <a
          href={buildMailtoUrl(draft)}
          className={editorialFormSubmitClassName}
        >
          Open in Mail →
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className={secondaryActionClassName}
        >
          {copied ? "Copied to Clipboard" : "Copy to Clipboard"}
        </button>
        <a
          href={buildGmailComposeUrl(draft)}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryActionClassName}
        >
          Open in Gmail →
        </a>
        <p className="pt-1 text-center text-xs font-light italic text-cocoa">
          Choose how you&apos;d like to send this email
        </p>
      </div>

      <p className="mt-10 max-w-3xl text-xs leading-relaxed text-leather/70">
        This email was drafted using Fretwell &amp; Co property compliance
        management software — fretwellcompliance.uk
      </p>
    </div>
  );
}
