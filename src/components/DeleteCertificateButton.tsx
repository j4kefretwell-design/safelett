"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${certificateLabel} certificate? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const supabase = createClient();

    if (documentPath) {
      await deleteCertificateDocuments(supabase, [documentPath]);
    }

    const { error: deleteError } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certificateId);

    if (deleteError) {
      window.alert(deleteError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
