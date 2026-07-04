"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildMailtoUrl,
  formatEmailForCopy,
  type ContractorEmailDraft,
} from "@/lib/contractor-email";
import {
  btnGoldClassName,
  btnOutlineClassName,
  btnPrimaryClassName,
  capsLabelClassName,
} from "@/lib/ui";

interface ContractorEmailDraftClientProps {
  draft: ContractorEmailDraft;
  certificateLabel: string;
  propertyAddress: string;
  backHref: string;
}

export default function ContractorEmailDraftClient({
  draft: initialDraft,
  certificateLabel,
  propertyAddress,
  backHref,
}: ContractorEmailDraftClientProps) {
  const [body, setBody] = useState(initialDraft.body);
  const [isEditing, setIsEditing] = useState(false);
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
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden px-5 py-10 sm:px-12 sm:py-14 lg:px-16">
      <Link
        href={backHref}
        className="text-base font-light leading-relaxed text-leather transition hover:text-text"
      >
        ← Back to Property
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className={capsLabelClassName}>Contractor Email Draft</p>
        <h1 className="mt-3 font-serif text-2xl tracking-wide text-raspberry sm:text-3xl">
          {certificateLabel}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-leather">{propertyAddress}</p>
      </header>

      <div className="mt-10 max-w-3xl border border-leather/25 bg-white">
        <div className="border-b border-leather/15 px-6 py-5 sm:px-8">
          <p className={capsLabelClassName}>To</p>
          <p className="mt-2 text-base leading-relaxed text-text">
            {draft.toName}{" "}
            <span className="text-leather">&lt;{draft.toEmail}&gt;</span>
          </p>
        </div>

        <div className="border-b border-leather/15 px-6 py-5 sm:px-8">
          <p className={capsLabelClassName}>Subject</p>
          <p className="mt-2 font-serif text-lg leading-relaxed tracking-wide text-text">
            {draft.subject}
          </p>
        </div>

        <div className="email-draft-paper px-6 py-8 sm:px-8 sm:py-10">
          <p className={capsLabelClassName}>Message</p>
          {isEditing ? (
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={16}
              className="mt-4 w-full resize-y border border-leather/20 bg-white/80 px-4 py-4 font-sans text-base leading-relaxed text-text outline-none focus:border-leather"
              aria-label="Email body"
            />
          ) : (
            <div className="mt-4 whitespace-pre-wrap font-sans text-base leading-relaxed text-text">
              {body}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-leather/80">
        This is a draft only — no email is sent from Fretwell &amp; Co. Copy or
        open in your mail app, then send from your own account.
      </p>

      <div className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={handleCopy} className={`${btnPrimaryClassName} w-full sm:w-auto`}>
          {copied ? "Copied to Clipboard" : "Copy Email"}
        </button>
        <a href={buildMailtoUrl(draft)} className={`${btnOutlineClassName} w-full sm:w-auto`}>
          Open in Mail
        </a>
        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className={`${btnOutlineClassName} w-full sm:w-auto`}
        >
          {isEditing ? "Preview Draft" : "Edit Draft"}
        </button>
        <Link href={backHref} className={`${btnGoldClassName} sm:ml-auto`}>
          Back to Property →
        </Link>
      </div>
    </div>
  );
}
