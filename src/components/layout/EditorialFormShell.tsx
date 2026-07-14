import Link from "next/link";
import { pageBackLinkClassName } from "@/lib/ui";

interface EditorialFormShellProps {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel?: string;
  children: React.ReactNode;
}

export default function EditorialFormShell({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  children,
}: EditorialFormShellProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden bg-parchment-warm">
      <section className="dashboard-portfolio-divider px-5 py-8 text-center sm:py-10">
        <p className="caps-label text-dusty-cream">{title}</p>
        <p className="mt-3 text-base italic leading-relaxed text-dusty-cream/90">
          {subtitle}
        </p>
      </section>

      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href={backHref} className={pageBackLinkClassName}>
          ← {backLabel}
        </Link>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
