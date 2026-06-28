"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCertificateDocuments } from "@/lib/certificate-documents";
import { createClient } from "@/lib/supabase/client";

interface DeletePropertyButtonProps {
  propertyId: string;
  propertyAddress: string;
  documentPaths: string[];
}

export default function DeletePropertyButton({
  propertyId,
  propertyAddress,
  documentPaths,
}: DeletePropertyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${propertyAddress}"? This will permanently remove the property and all its certificates.`
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = createClient();

    await deleteCertificateDocuments(supabase, documentPaths);

    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-slate-900">Delete Property</h2>
      <p className="mt-1 text-sm text-slate-600">
        Permanently remove this property and all associated certificates.
      </p>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Property"}
      </button>
    </div>
  );
}
