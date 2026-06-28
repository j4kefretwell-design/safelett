import Link from "next/link";
import { btnGoldClassName, btnPrimaryClassName } from "@/lib/ui";

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
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center text-sm font-medium text-mahogany-900/60 transition hover:text-mahogany-950"
        >
          ← {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-mahogany-950 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-mahogany-900/60">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

export { btnGoldClassName, btnPrimaryClassName };
