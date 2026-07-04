import Link from "next/link";
import { btnPrimaryClassName, btnSecondaryClassName, editorialBleedClassName } from "@/lib/ui";

interface PropertyPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryAction?: React.ReactNode;
}

export default function PropertyPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actionHref,
  actionLabel,
  secondaryAction,
}: PropertyPageHeaderProps) {
  return (
    <div className="relative mb-12 lg:mb-14">
      <div className={`bg-raspberry py-12 ${editorialBleedClassName} px-8 sm:px-12 lg:px-16`}>
        {backHref && (
          <Link
            href={backHref}
            className="mb-8 inline-flex text-xs font-light tracking-[0.1em] text-dusty-cream/55 transition hover:text-dusty-cream"
          >
            ← {backLabel}
          </Link>
        )}

        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl leading-snug tracking-wide text-dusty-cream sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>
            <div className="mt-5 h-px w-20 bg-gold/60" aria-hidden="true" />
            {description && (
              <p className="mt-5 text-sm font-light tracking-wide text-dusty-cream/65">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {secondaryAction}
            {actionHref && actionLabel && (
              <Link
                href={actionHref}
                className="inline-flex items-center justify-center border border-dusty-cream/35 bg-dusty-cream px-5 py-2.5 text-xs font-normal uppercase tracking-[0.1em] text-text transition hover:bg-dusty-cream/90"
              >
                {actionLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { btnPrimaryClassName, btnSecondaryClassName };
