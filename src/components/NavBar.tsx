import Link from "next/link";

interface NavBarProps {
  showAddProperty?: boolean;
}

export default function NavBar({ showAddProperty = true }: NavBarProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-xl font-bold text-slate-900">
          SafeLett
        </Link>
        {showAddProperty && (
          <Link
            href="/properties/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Add Property
          </Link>
        )}
      </div>
    </header>
  );
}
