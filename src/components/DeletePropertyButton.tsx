"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCertificateDocuments } from "@/lib/certificate-documents";
import { createClient } from "@/lib/supabase/client";
import { btnDangerClassName, cardClassName } from "@/lib/ui";

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
    <div className={`${cardClassName} mt-10 border-red-200 p-6`}>
      <h2 className="font-serif text-lg font-semibold text-mahogany-950">Delete Property</h2>
      <p className="mt-1 text-sm text-mahogany-900/60">
        Permanently remove this property and all associated certificates.
      </p>
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-urgent-light px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className={`${btnDangerClassName} mt-4`}
      >
        {loading ? "Deleting..." : "Delete Property"}
      </button>
    </div>
  );
}
