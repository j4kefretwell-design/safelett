"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnDangerClassName } from "@/lib/ui";

interface DeleteTenancyButtonProps {
  tenancyId: string;
}

export default function DeleteTenancyButton({ tenancyId }: DeleteTenancyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("tenancies").delete().eq("id", tenancyId);

    if (error) {
      setLoading(false);
      return;
    }

    router.push("/tenancy/dashboard");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={btnDangerClassName}
      >
        Delete Tenancy
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className={btnDangerClassName}
      >
        {loading ? "Deleting..." : "Confirm Delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-sm text-steel underline-offset-4 hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
