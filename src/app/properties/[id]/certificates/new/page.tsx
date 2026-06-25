import Link from "next/link";
import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import CertificateForm from "@/components/CertificateForm";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";

interface NewCertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewCertificatePage({
  params,
}: NewCertificatePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) {
    notFound();
  }

  const typedProperty = property as Property;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar showAddProperty={false} />

      <main className="mx-auto max-w-lg px-4 py-8">
        <Link
          href={`/properties/${id}`}
          className="text-sm text-slate-600 transition hover:text-slate-900"
        >
          ← Back to Property
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Add Certificate
        </h1>
        <p className="mt-1 text-sm text-slate-600">{typedProperty.address}</p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <CertificateForm propertyId={id} />
        </div>
      </main>
    </div>
  );
}
