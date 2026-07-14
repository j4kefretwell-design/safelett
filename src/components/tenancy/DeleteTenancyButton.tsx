"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/toast/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { btnDangerClassName } from "@/lib/ui";

interface DeleteTenancyButtonProps {
  tenancyId: string;
}

export default function DeleteTenancyButton({ tenancyId }: DeleteTenancyButtonProps) {
  const router = useRouter();
  const { deleted, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    const { data: tenancyRow } = await supabase
      .from("tenancies")
      .select("*")
      .eq("id", tenancyId)
      .maybeSingle();

    const { error } = await supabase.from("tenancies").delete().eq("id", tenancyId);

    if (error) {
      toastError();
      setLoading(false);
      setConfirming(false);
      return;
    }

    setConfirming(false);
    deleted("Tenancy deleted", async () => {
      if (!tenancyRow) return;
      await supabase.from("tenancies").insert(tenancyRow);
      router.refresh();
    });
    router.push("/tenancy/dashboard");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={btnDangerClassName}
      >
        Delete Tenancy
      </button>
      <ConfirmDialog
        open={confirming}
        title="Delete tenancy?"
        message="Are you sure you want to delete this tenancy record? This cannot be undone."
        confirmLabel="Confirm Delete"
        loading={loading}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
