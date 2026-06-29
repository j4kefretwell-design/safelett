"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  cardClassName,
  fileInputClassName,
  mutedTextClassName,
} from "@/lib/ui";

interface ImportFormProps {
  templateUrl: string;
}

export default function ImportForm({ templateUrl }: ImportFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    propertiesCreated: number;
    certificatesCreated: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please choose a CSV file to upload.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        errors?: string[];
        propertiesCreated?: number;
        certificatesCreated?: number;
      };

      if (!response.ok) {
        if (data.errors?.length) {
          setError(data.errors.slice(0, 5).join(" "));
        } else {
          setError(data.error ?? "Import failed.");
        }
        setLoading(false);
        return;
      }

      setResult({
        propertiesCreated: data.propertiesCreated ?? 0,
        certificatesCreated: data.certificatesCreated ?? 0,
      });
      setFile(null);
      router.refresh();
    } catch {
      setError("Unable to upload file. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className={`${cardClassName} p-6 sm:p-8`}>
        <h2 className="font-serif text-lg font-medium text-charcoal">
          Step 1 — Download template
        </h2>
        <p className={`${mutedTextClassName} mt-2`}>
          Fill in one row per certificate. Repeat the same address on multiple
          rows to add several certificates to one property. Leave certificate
          columns blank for property-only rows.
        </p>
        <a
          href={templateUrl}
          download="safelett-import-template.csv"
          className={`${btnSecondaryClassName} mt-4`}
        >
          Download CSV Template
        </a>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClassName} p-6 sm:p-8`}>
        <h2 className="font-serif text-lg font-medium text-charcoal">
          Step 2 — Upload completed file
        </h2>
        <p className={`${mutedTextClassName} mt-2`}>
          Upload your completed CSV to import properties and certificates in
          one go.
        </p>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={`${fileInputClassName} mt-4`}
        />

        {error && (
          <p className="mt-4 rounded-sm border border-red-200 bg-urgent-light px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}

        {result && (
          <p className="mt-4 rounded-sm border border-compliant/20 bg-compliant-light px-4 py-3 text-sm text-compliant">
            Import complete — {result.propertiesCreated}{" "}
            {result.propertiesCreated === 1 ? "property" : "properties"} and{" "}
            {result.certificatesCreated}{" "}
            {result.certificatesCreated === 1 ? "certificate" : "certificates"}{" "}
            added.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className={`${btnPrimaryClassName} mt-6`}
        >
          {loading ? "Importing..." : "Import Properties"}
        </button>
      </form>
    </div>
  );
}
