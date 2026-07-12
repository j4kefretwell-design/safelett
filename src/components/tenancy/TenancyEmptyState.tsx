import Link from "next/link";
import { btnPrimaryClassName } from "@/lib/ui";

export default function TenancyEmptyState() {
  return (
    <div className="tenancy-slate-bg flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="caps-label text-steel">Tenancy Management</p>
      <h1 className="mt-6 max-w-lg font-serif text-3xl tracking-wide text-tenancy-text sm:text-4xl">
        Your Tenancy Portfolio Awaits
      </h1>
      <p className="mt-5 max-w-md text-base font-light leading-relaxed text-steel">
        Add your first tenancy to track lease dates, rent reviews, deposit
        protection, and right to rent compliance.
      </p>
      <Link href="/tenancy/new" className={`${btnPrimaryClassName} mt-10 bg-navy hover:bg-navy-dark`}>
        Add Your First Tenancy
      </Link>
    </div>
  );
}
