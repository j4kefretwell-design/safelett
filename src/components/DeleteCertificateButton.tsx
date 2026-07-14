"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/toast/ToastProvider";
import { deleteCertificateDocuments } from "@/lib/certificate-documents";
import { createClient } from "@/lib/supabase/client";

interface DeleteCertificateButtonProps {
  certificateId: string;
  certificateLabel: string;
  documentPath: string | null;
}

export default function DeleteCertificateButton({
  certificateId,
  certificateLabel,
  documentPath,
}: DeleteCertificateButtonProps) {
  const router = useRouter();
  const { deleted, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: certificateRow } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", certificateId)
      .maybeSingle();

    if (documentPath) {
      await deleteCertificateDocuments(supabase, [documentPath]);
    }

    const { error: deleteError } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certificateId);

    if (deleteError) {
      setError(deleteError.message);
      toastError();
      setLoading(false);
      setConfirming(false);
      return;
    }

    setConfirming(false);
    deleted("Certificate deleted", async () => {
      if (!certificateRow) return;
      await supabase.from("certificates").insert(certificateRow);
      router.refresh();
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={loading}
        className="text-sm font-medium text-urgent transition hover:text-burgundy disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="mt-1 text-xs text-urgent">{error}</p>}
      <ConfirmDialog
        open={confirming}
        title="Delete certificate?"
        message={`Are you sure you want to delete the ${certificateLabel} certificate? This cannot be undone.`}
        confirmLabel="Confirm Delete"
        loading={loading}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
