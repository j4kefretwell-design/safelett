"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  goldLabelClassName,
} from "@/lib/ui";

const steps = [
  {
    number: "01",
    title: "Download template",
    body: "Get the CSV with the correct columns.",
  },
  {
    number: "02",
    title: "Fill your data",
    body: "One row per certificate, repeat addresses as needed.",
  },
  {
    number: "03",
    title: "Upload and import",
    body: "Drop your completed file to add everything.",
  },
];

const fullGuide = `Each row in the CSV represents one certificate. Repeat the same property address for multiple certificates on one property.

Required columns: address, property_type, bedrooms, certificate_type, issue_date, expiry_date.

Property types: standard_rental, hmo, student_let.

Dates must be YYYY-MM-DD. Leave certificate columns empty for property-only rows.`;

export default function ImportPropertiesPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
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
    <div className="grid min-h-[calc(100vh-4rem)] w-full bg-dusty-cream lg:grid-cols-[14rem_1fr] xl:grid-cols-[16rem_1fr]">
      <aside className="border-b border-leather/15 bg-espresso px-8 py-12 text-dusty-cream lg:border-b-0 lg:border-r lg:py-16">
        <ol className="space-y-10">
          {steps.map((step) => (
            <li key={step.number}>
              <p className="text-sm font-light tracking-[0.2em] text-gold">
                {step.number}
              </p>
              <h2 className="mt-3 font-serif text-base tracking-wide">
                {step.title}
              </h2>
              <p className="mt-2 text-xs font-light leading-relaxed text-dusty-cream/60">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </aside>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-white px-8 py-12 lg:px-16 lg:py-16"
      >
        <label
          htmlFor="csv-upload"
          className="flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-leather/30 bg-dusty-cream/30 px-8 py-24 text-center transition hover:border-leather/50"
        >
          <Upload className="h-8 w-8 text-leather/40" strokeWidth={1.25} />
          <p className="mt-6 font-serif text-xl tracking-wide text-text">
            Drop your CSV here
          </p>
          <p className="mt-2 text-sm font-light italic text-leather">
            or browse to select a file
          </p>
          {file && <p className={`${goldLabelClassName} mt-6`}>{file.name}</p>}
          <input
            id="csv-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>

        <a
          href="/api/import/template"
          download="fretwell-co-import-template.csv"
          className={`${btnOutlineClassName} mt-6 w-full sm:w-auto`}
        >
          Download Template →
        </a>

        {error && (
          <p className="mt-8 border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}

        {result && (
          <p className="mt-8 border border-compliant/20 bg-compliant-light px-4 py-3 text-sm text-compliant">
            Import complete — {result.propertiesCreated}{" "}
            {result.propertiesCreated === 1 ? "property" : "properties"} and{" "}
            {result.certificatesCreated}{" "}
            {result.certificatesCreated === 1 ? "certificate" : "certificates"}{" "}
            added.
          </p>
        )}

        <div className="mt-auto space-y-6 pt-10">
          <button
            type="submit"
            disabled={loading || !file}
            className={`${btnPrimaryClassName} w-full sm:w-auto`}
          >
            {loading ? "Importing..." : "Import Properties"}
          </button>

          <button
            type="button"
            onClick={() => setShowGuide((current) => !current)}
            className="text-[11px] font-light tracking-wide text-gold transition hover:text-gold/80"
          >
            Need help? View full guide →
          </button>

          {showGuide && (
            <p className="max-w-lg whitespace-pre-line text-sm font-light leading-relaxed text-leather">
              {fullGuide}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
