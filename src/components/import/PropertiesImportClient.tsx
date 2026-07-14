"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import PageBackLink from "@/components/PageBackLink";
import { useToast } from "@/components/toast/ToastProvider";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  editorialFormCancelClassName,
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

export default function PropertiesImportClient() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
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
        toastError();
        setLoading(false);
        return;
      }

      setResult({
        propertiesCreated: data.propertiesCreated ?? 0,
        certificatesCreated: data.certificatesCreated ?? 0,
      });
      setFile(null);
      success("Import completed successfully");
      router.refresh();
    } catch {
      setError("Unable to upload file. Please try again.");
      toastError();
    }

    setLoading(false);
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden bg-dusty-cream lg:grid-cols-[14rem_1fr] xl:grid-cols-[16rem_1fr]">
      <aside className="border-b border-leather/15 bg-espresso px-5 py-10 text-dusty-cream sm:px-8 sm:py-12 lg:border-b-0 lg:border-r lg:py-16">
        <ol className="space-y-8 sm:space-y-10">
          {steps.map((step) => (
            <li key={step.number}>
              <p className="text-base font-light tracking-[0.2em] text-gold">
                {step.number}
              </p>
              <h2 className="mt-3 font-serif text-lg tracking-wide">
                {step.title}
              </h2>
              <p className="mt-2 text-sm font-light leading-relaxed text-dusty-cream/80">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </aside>

      <form
        onSubmit={handleSubmit}
        className="flex min-w-0 flex-col bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-16 lg:py-16"
      >
        <PageBackLink href="/compliance">← Back to Dashboard</PageBackLink>

        <label
          htmlFor="csv-upload"
          className="mt-8 flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-leather/30 bg-dusty-cream/30 px-8 py-24 text-center transition hover:border-leather/50"
        >
          <Upload className="h-8 w-8 text-leather/40" strokeWidth={1.25} />
          <p className="mt-6 font-serif text-xl tracking-wide text-text">
            Drop your CSV here
          </p>
          <p className="mt-2 text-base font-light italic leading-relaxed text-leather">
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
          <div>
            <button
              type="submit"
              disabled={loading || !file}
              className={`${btnPrimaryClassName} w-full sm:w-auto`}
            >
              {loading ? "Importing..." : "Import Properties"}
            </button>
            <Link href="/compliance" className={editorialFormCancelClassName}>
              Cancel
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowGuide((current) => !current)}
            className="text-sm font-light leading-relaxed text-gold-readable transition hover:text-gold"
          >
            Need help? View full guide →
          </button>

          {showGuide && (
            <p className="max-w-lg whitespace-pre-line text-base font-light leading-relaxed text-leather">
              {fullGuide}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
