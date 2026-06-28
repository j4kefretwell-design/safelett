"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  cardClassName,
  textareaClassName,
} from "@/lib/ui";

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
    <div className={`${cardClassName} mt-8 p-6`}>
      <h2 className="font-serif text-lg font-semibold text-mahogany-950">Property Notes</h2>
      <p className="mt-1 text-sm text-mahogany-900/60">
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
        className={`${textareaClassName} mt-4`}
      />

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-urgent-light px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={btnPrimaryClassName}
        >
          {loading ? "Saving..." : "Save Notes"}
        </button>
        {saved && (
          <span className="text-sm font-medium text-compliant">Notes saved.</span>
        )}
      </div>
    </div>
  );
}
