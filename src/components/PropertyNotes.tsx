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
  compact?: boolean;
}

export default function PropertyNotes({
  propertyId,
  initialNotes,
  compact = false,
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

  if (compact) {
    return (
      <div>
        <h2 className="text-[10px] font-normal uppercase tracking-[0.28em] text-leather">
          Notes
        </h2>
        <div className="mt-3 h-px w-16 bg-gold/80" aria-hidden />

        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          rows={4}
          placeholder='e.g. "Boiler located in kitchen cupboard"'
          className={`${textareaClassName} mt-6 border-taupe bg-vanilla`}
        />

        {error && (
          <p className="mt-4 border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center border border-leather/30 bg-transparent px-5 text-[11px] font-normal uppercase tracking-[0.1em] text-leather transition hover:border-leather hover:text-text disabled:opacity-50"
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
