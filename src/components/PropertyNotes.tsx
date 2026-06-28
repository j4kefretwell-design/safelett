"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PropertyNotesProps {
  propertyId: string;
  initialNotes: string | null;
}

export default function PropertyNotes({
  propertyId,
  initialNotes,
}: PropertyNotesProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("properties")
      .update({ notes: notes.trim() || null })
      .eq("id", propertyId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Property Notes</h2>
      <p className="mt-1 text-sm text-slate-600">
        Add free text notes about this property — for example boiler location or
        licence applications in progress.
      </p>

      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder='e.g. "Boiler located in kitchen cupboard" or "HMO licence application in progress"'
        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
      />

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Notes"}
        </button>
        {saved && (
          <span className="text-sm text-green-600">Notes saved.</span>
        )}
      </div>
    </div>
  );
}
