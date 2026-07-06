import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";

interface LegalPageShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageShell({
  title,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-parchment-warm">
      <header className="border-b border-gold bg-raspberry px-5 py-10 text-center sm:py-12">
        <Link href="/" className="inline-block">
          <BrandWordmark href={null} variant="footer" />
        </Link>
        <p className="mt-8 caps-label text-dusty-cream">{title}</p>
        <p className="mt-3 text-sm italic leading-relaxed text-dusty-cream/90">
          Last updated {lastUpdated}
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <article className="legal-prose text-base leading-relaxed text-text">
          {children}
        </article>

        <p className="mt-14 border-t border-leather/20 pt-8 text-center text-sm text-leather">
          <Link href="/" className="transition hover:text-raspberry">
            ← Back to Fretwell &amp; Co
          </Link>
        </p>
      </main>
    </div>
  );
}
