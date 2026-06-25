import Link from "next/link";
import NavBar from "@/components/NavBar";
import PropertyForm from "@/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar showAddProperty={false} />

      <main className="mx-auto max-w-lg px-4 py-8">
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 transition hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Add Property</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter the details for a new property to track.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <PropertyForm />
        </div>
      </main>
    </div>
  );
}
