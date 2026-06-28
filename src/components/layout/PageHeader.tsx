import Link from "next/link";
import { btnPrimaryClassName } from "@/lib/ui";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actionHref,
  actionLabel,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-navy-900"
        >
          ← {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actionHref && actionLabel && (
          <Link href={actionHref} className={btnPrimaryClassName}>
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
