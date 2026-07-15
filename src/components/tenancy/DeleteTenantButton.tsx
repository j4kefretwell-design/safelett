"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/toast/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { btnDangerClassName } from "@/lib/ui";

interface DeleteTenantButtonProps {
  tenantId: string;
}

export default function DeleteTenantButton({ tenantId }: DeleteTenantButtonProps) {
  const router = useRouter();
  const { deleted, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .maybeSingle();

    const { error } = await supabase.from("tenants").delete().eq("id", tenantId);

    if (error) {
      toastError();
      setLoading(false);
      setConfirming(false);
      return;
    }

    setConfirming(false);
    deleted("Tenant deleted", async () => {
      if (!tenantRow) return;
      await supabase.from("tenants").insert(tenantRow);
      router.refresh();
    });
    router.push("/tenancy/tenants");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={btnDangerClassName}
      >
        Delete Tenant
      </button>
      <ConfirmDialog
        open={confirming}
        title="Delete tenant?"
        message="Are you sure you want to delete this tenant contact? This cannot be undone."
        confirmLabel="Confirm Delete"
        loading={loading}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
