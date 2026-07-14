"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/toast/ToastProvider";
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
  const { deleted, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const [{ data: propertyRow }, { data: certificateRows }] = await Promise.all([
      supabase.from("properties").select("*").eq("id", propertyId).maybeSingle(),
      supabase.from("certificates").select("*").eq("property_id", propertyId),
    ]);

    await deleteCertificateDocuments(supabase, documentPaths);

    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (deleteError) {
      setError(deleteError.message);
      toastError();
      setLoading(false);
      setConfirming(false);
      return;
    }

    setConfirming(false);
    deleted("Property deleted", async () => {
      if (!propertyRow) return;
      await supabase.from("properties").insert(propertyRow);
      if (certificateRows?.length) {
        await supabase.from("certificates").insert(certificateRows);
      }
      router.refresh();
    });
    router.push("/compliance");
    router.refresh();
  }

  return (
    <div className={`${cardClassName} mt-12 p-6`}>
      <h2 className="font-serif text-lg font-medium text-charcoal">Delete Property</h2>
      <p className="mt-1 text-sm text-charcoal-muted">
        Permanently remove this property and all associated certificates.
      </p>
      {error && (
        <p className="mt-3 rounded-sm border border-red-200 bg-urgent-light px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={loading}
        className={`${btnDangerClassName} mt-4`}
      >
        Delete Property
      </button>

      <ConfirmDialog
        open={confirming}
        title="Delete property?"
        message={`Are you sure you want to delete "${propertyAddress}"? This will permanently remove the property and all its certificates.`}
        confirmLabel="Confirm Delete"
        loading={loading}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
