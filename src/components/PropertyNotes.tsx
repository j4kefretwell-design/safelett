"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  cardClassName,
  formSectionRuleClassName,
  formSectionTitleClassName,
  mutedTextClassName,
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
    <div className={`${cardClassName} p-8`}>
      <h2 className={formSectionTitleClassName}>Property Notes</h2>
      <div className={formSectionRuleClassName} aria-hidden="true" />
      <p className={`${mutedTextClassName} mt-4`}>
        Free text notes — boiler location, licence applications, and anything
        else worth remembering.
      </p>

      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder='e.g. "Boiler located in kitchen cupboard"'
        className={`${textareaClassName} mt-6`}
      />

      {error && (
        <p className="mt-4 border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={btnPrimaryClassName}
        >
          {loading ? "Saving..." : "Save Notes"}
        </button>
        {saved && (
          <span className="text-sm font-light text-compliant">Saved.</span>
        )}
      </div>
    </div>
  );
}
