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
    <div className="mb-10 lg:mb-12">
      {backHref && (
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center text-sm text-charcoal-muted transition hover:text-charcoal"
        >
          ← {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-charcoal sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">
              {description}
            </p>
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
