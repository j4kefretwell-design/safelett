"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  formatNoticeForCopy,
  TENANCY_NOTICE_LABELS,
  type TenancyNoticeDraft,
  type TenancyNoticeType,
} from "@/lib/tenancy-notices";
import { capsLabelClassName, pageBackLinkClassName } from "@/lib/ui";

interface TenancyNoticeDraftClientProps {
  drafts: Record<TenancyNoticeType, TenancyNoticeDraft>;
  tenantNames: string;
  propertyAddress: string;
  backHref: string;
}

const secondaryActionClassName =
  "flex h-10 w-full items-center justify-center border border-steel/35 bg-transparent text-xs font-normal uppercase tracking-[0.1em] text-steel transition duration-200 hover:border-navy hover:text-navy";

export default function TenancyNoticeDraftClient({
  drafts,
  tenantNames,
  propertyAddress,
  backHref,
}: TenancyNoticeDraftClientProps) {
  const { success, error: toastError } = useToast();
  const [noticeType, setNoticeType] = useState<TenancyNoticeType>("renewal_offer");
  const [body, setBody] = useState(drafts.renewal_offer.body);
  const [copied, setCopied] = useState(false);

  const draft = useMemo(
    () => ({
      ...drafts[noticeType],
      body,
    }),
    [body, drafts, noticeType]
  );

  function handleNoticeTypeChange(nextType: TenancyNoticeType) {
    setNoticeType(nextType);
    setBody(drafts[nextType].body);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatNoticeForCopy(draft));
      setCopied(true);
      success("Notice copied to clipboard");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      toastError("Unable to copy notice.");
    }
  }

  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)] px-5 py-10 sm:px-12 sm:py-14 lg:px-16">
      <Link href={backHref} className={pageBackLinkClassName}>
        ← Back to Tenancy
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className={capsLabelClassName}>Tenancy Notice Draft</p>
        <h1 className="mt-3 font-serif text-2xl tracking-wide text-navy sm:text-3xl">
          {tenantNames}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-steel">{propertyAddress}</p>
      </header>

      <div className="mt-8 max-w-3xl">
        <label htmlFor="noticeType" className="mb-2 block text-sm uppercase tracking-[0.14em] text-steel">
          Notice Type
        </label>
        <select
          id="noticeType"
          value={noticeType}
          onChange={(event) =>
            handleNoticeTypeChange(event.target.value as TenancyNoticeType)
          }
          className="w-full border-0 border-b border-steel/30 bg-transparent py-3 text-base text-tenancy-text outline-none focus:border-navy"
        >
          {(Object.keys(TENANCY_NOTICE_LABELS) as TenancyNoticeType[]).map((type) => (
            <option key={type} value={type}>
              {TENANCY_NOTICE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="email-composition mt-10 max-w-3xl border border-steel/15 bg-white">
        <div className="border-b border-steel/15 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="shrink-0 text-sm text-steel">Subject:</span>
            <span className="text-base text-tenancy-text">{draft.subject}</span>
          </div>
        </div>

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={18}
          className="w-full resize-y border-0 bg-transparent px-5 py-6 font-sans text-base leading-relaxed text-tenancy-text outline-none sm:px-6"
        />
      </div>

      <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
        <a href={buildMailtoUrl(draft)} className={secondaryActionClassName}>
          Open in Mail →
        </a>
        <button type="button" onClick={handleCopy} className={secondaryActionClassName}>
          {copied ? "Copied" : "Copy to Clipboard"}
        </button>
        <a
          href={buildGmailComposeUrl(draft)}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryActionClassName}
        >
          Open in Gmail →
        </a>
      </div>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-steel/80">
        These notices are provided as drafting assistance only and do not constitute
        legal advice. You should review all notices before service and seek
        independent legal advice where appropriate.
      </p>
    </div>
  );
}
