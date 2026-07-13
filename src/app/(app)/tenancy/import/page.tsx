"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import {
  btnOutlineClassName,
  goldLabelClassName,
} from "@/lib/ui";

const steps = [
  {
    number: "01",
    title: "Download the CSV template",
    body: "Get the spreadsheet with the correct tenancy columns.",
  },
  {
    number: "02",
    title: "Fill in your tenancy details",
    body: "One row per tenancy. Use YYYY-MM-DD for all dates.",
  },
  {
    number: "03",
    title: "Upload and import",
    body: "Drop your completed file to add every tenancy at once.",
  },
];

const fullGuide = `Each row in the CSV represents one tenancy.

Required columns: tenant_names, property_address, tenancy_type, start_date, end_date, monthly_rent.

Optional columns: rent_review_date, deposit_amount, deposit_scheme, deposit_protection_date, right_to_rent_expiry.

Tenancy types: assured_shorthold, periodic, fixed_term, student_let, hmo_room.

Deposit schemes: dps, mydeposits, tds, none.

Dates must be YYYY-MM-DD. If property_address matches an existing property, the tenancy will be linked automatically.`;

export default function TenancyImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [result, setResult] = useState<{ tenanciesCreated: number } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRowErrors([]);
    setResult(null);

    if (!file) {
      setError("Please choose a CSV file to upload.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/tenancy-import", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        errors?: string[];
        tenanciesCreated?: number;
      };

      if (!response.ok) {
        if (data.errors?.length) {
          setRowErrors(data.errors);
          setError(`${data.errors.length} row${data.errors.length === 1 ? "" : "s"} failed validation.`);
        } else {
          setError(data.error ?? "Import failed.");
        }
        setLoading(false);
        return;
      }

      if (data.errors?.length) {
        setRowErrors(data.errors);
      }

      setResult({
        tenanciesCreated: data.tenanciesCreated ?? 0,
      });
      setFile(null);
      router.refresh();
    } catch {
      setError("Unable to upload file. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden bg-[#f0f2f5] lg:grid-cols-[14rem_1fr] xl:grid-cols-[16rem_1fr]">
      <aside className="border-b border-navy/20 bg-navy px-5 py-10 text-dusty-cream sm:px-8 sm:py-12 lg:border-b-0 lg:border-r lg:border-navy-dark lg:py-16">
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
        <label
          htmlFor="tenancy-csv-upload"
          className="flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-steel/30 bg-[#f0f2f5]/60 px-8 py-24 text-center transition hover:border-navy/40"
        >
          <Upload className="h-8 w-8 text-steel/40" strokeWidth={1.25} />
          <p className="mt-6 font-serif text-xl tracking-wide text-tenancy-text">
            Drop your CSV here
          </p>
          <p className="mt-2 text-base font-light italic leading-relaxed text-steel">
            or browse to select a file
          </p>
          {file && <p className={`${goldLabelClassName} mt-6`}>{file.name}</p>}
          <input
            id="tenancy-csv-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>

        <a
          href="/api/tenancy-import/template"
          download="fretwell-co-tenancy-import-template.csv"
          className={`${btnOutlineClassName} mt-6 w-full border-navy/30 text-navy hover:border-navy hover:text-navy sm:w-auto`}
        >
          Download Template →
        </a>

        {error && (
          <p className="mt-8 border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}

        {rowErrors.length > 0 && (
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto border border-urgent/15 bg-urgent-light/30 px-4 py-3 text-sm text-urgent">
            {rowErrors.map((rowError) => (
              <li key={rowError}>{rowError}</li>
            ))}
          </ul>
        )}

        {result && (
          <p className="mt-8 border border-compliant/20 bg-compliant-light px-4 py-3 text-sm text-compliant">
            {result.tenanciesCreated}{" "}
            {result.tenanciesCreated === 1 ? "tenancy" : "tenancies"} imported
            successfully
            {rowErrors.length > 0
              ? ` · ${rowErrors.length} row${rowErrors.length === 1 ? "" : "s"} skipped`
              : ""}
            .
          </p>
        )}

        <div className="mt-auto space-y-6 pt-10">
          <button
            type="submit"
            disabled={loading || !file}
            className="inline-flex min-h-11 w-full items-center justify-center bg-navy px-6 py-3 text-[0.9375rem] font-normal uppercase tracking-[0.1em] text-dusty-cream transition hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Importing..." : "Import Tenancies"}
          </button>

          <button
            type="button"
            onClick={() => setShowGuide((current) => !current)}
            className="text-sm font-light leading-relaxed text-gold-readable transition hover:text-gold"
          >
            Need help? View full guide →
          </button>

          {showGuide && (
            <p className="max-w-lg whitespace-pre-line text-base font-light leading-relaxed text-steel">
              {fullGuide}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
