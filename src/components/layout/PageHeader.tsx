import Link from "next/link";
import {
  btnPrimaryClassName,
  pageTitleClassName,
  pageTitleRuleClassName,
} from "@/lib/ui";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryAction?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actionHref,
  actionLabel,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <div className="mb-12 lg:mb-14">
      {backHref && (
        <Link
          href={backHref}
          className="mb-8 inline-flex text-xs font-light tracking-[0.1em] text-cocoa transition hover:text-text"
        >
          ← {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className={pageTitleClassName}>{title}</h1>
          <div className={pageTitleRuleClassName} aria-hidden="true" />
          {description && (
            <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-cocoa">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {secondaryAction}
          {actionHref && actionLabel && (
            <Link href={actionHref} className={btnPrimaryClassName}>
              {actionLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
