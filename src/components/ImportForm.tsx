"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import UpgradeOverlay from "@/components/subscription/UpgradeOverlay";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  editorialBleedClassName,
  goldLabelClassName,
  tableHeaderClassName,
  tableRowClassName,
} from "@/lib/ui";

interface ImportFormProps {
  templateUrl: string;
}

const steps = [
  {
    number: "01",
    title: "Download the template",
    body: "Use our CSV template with the correct columns for properties and certificates.",
  },
  {
    number: "02",
    title: "Complete your data",
    body: "Add one row per certificate. Repeat the same address for multiple certificates on one property.",
  },
  {
    number: "03",
    title: "Upload and import",
    body: "Drop your completed file in the centre panel and review the format on the right.",
  },
];

const previewHeaders = [
  "Address",
  "Property Type",
  "Bedrooms",
  "Certificate",
  "Issue Date",
  "Expiry Date",
];

const previewRows = [
  [
    "12 Marlborough Road",
    "standard_rental",
    "3",
    "gas_safety",
    "2024-06-01",
    "2025-06-01",
  ],
  [
    "12 Marlborough Road",
    "standard_rental",
    "3",
    "eicr",
    "2023-01-15",
    "2028-01-15",
  ],
  [
    "45 Church Lane",
    "hmo",
    "5",
    "hmo_licence",
    "2022-03-01",
    "2027-03-01",
  ],
];

export default function ImportForm({ templateUrl }: ImportFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    title: string;
    message: string;
  } | null>(null);
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
        code?: string;
        title?: string;
        message?: string;
        propertiesCreated?: number;
        certificatesCreated?: number;
      };

      if (!response.ok) {
        if (data.code === "UPGRADE_REQUIRED") {
          setUpgradePrompt({
            title: data.title || "You've reached the 15 property limit",
            message:
              data.message ||
              "Upgrade to Professional for unlimited properties.",
          });
          setLoading(false);
          return;
        }
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
    <div
      className={`grid min-h-[calc(100vh-8rem)] lg:grid-cols-[16rem_1fr_18rem] xl:grid-cols-[18rem_1fr_20rem] ${editorialBleedClassName}`}
    >
      {upgradePrompt ? (
        <UpgradeOverlay
          title={upgradePrompt.title}
          message={upgradePrompt.message}
          onDismiss={() => setUpgradePrompt(null)}
        />
      ) : null}
      <aside className="border-b border-leather/15 bg-espresso px-8 py-12 text-dusty-cream lg:border-b-0 lg:border-r lg:py-16">
        <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-dusty-cream/50">
          Bulk Import
        </p>
        <h1 className="mt-4 font-serif text-2xl tracking-wide sm:text-3xl">
          Import Your Portfolio
        </h1>
        <div className="mt-5 h-px w-12 bg-gold/50" aria-hidden="true" />

        <ol className="mt-12 space-y-10">
          {steps.map((step) => (
            <li key={step.number}>
              <p className="text-sm font-light tracking-[0.2em] text-gold">
                {step.number}
              </p>
              <h2 className="mt-4 font-serif text-lg tracking-wide">
                {step.title}
              </h2>
              <p className="mt-2 text-sm font-light leading-relaxed text-dusty-cream/65">
                {step.body}
              </p>
              {step.number === "01" && (
                <a
                  href={templateUrl}
                  download="fretwell-co-import-template.csv"
                  className={`${btnOutlineClassName} mt-5 inline-flex border-dusty-cream/30 text-dusty-cream hover:border-dusty-cream/60 hover:text-dusty-cream`}
                >
                  Download Template
                </a>
              )}
            </li>
          ))}
        </ol>
      </aside>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col border-b border-leather/15 bg-dusty-cream px-8 py-12 lg:border-b-0 lg:border-r lg:px-12 lg:py-16"
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
          Upload
        </p>
        <h2 className="mt-4 font-serif text-2xl tracking-wide text-heading">
          Drop Your CSV File
        </h2>
        <div className="mt-5 h-px w-12 bg-gold/70" aria-hidden="true" />

        <label
          htmlFor="csv-upload"
          className="mt-10 flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-leather/30 bg-sand px-8 py-20 text-center transition hover:border-tan"
        >
          <Upload className="h-8 w-8 text-leather/50" strokeWidth={1.25} />
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

        <div className="mt-auto pt-10">
          <button
            type="submit"
            disabled={loading || !file}
            className={`${btnPrimaryClassName} w-full`}
          >
            {loading ? "Importing..." : "Import Properties"}
          </button>
        </div>
      </form>

      <aside className="bg-sand/40 px-8 py-12 lg:py-16">
        <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
          Format Reference
        </p>
        <h2 className="mt-4 font-serif text-xl tracking-wide text-heading">
          Valid CSV Structure
        </h2>
        <div className="mt-5 h-px w-12 bg-gold/70" aria-hidden="true" />
        <p className="mt-5 text-sm font-light leading-relaxed text-leather">
          Each row represents one certificate. Repeat the property address for
          multiple certificates on the same property.
        </p>

        <div className="mt-8 overflow-x-auto border border-leather/20 bg-dusty-cream">
          <table className="w-full min-w-[28rem] text-left text-xs">
            <thead>
              <tr className={tableHeaderClassName}>
                {previewHeaders.map((header) => (
                  <th key={header} className="px-4 py-3 font-normal">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr
                  key={row.join("-")}
                  className={`${tableRowClassName} ${
                    rowIndex % 2 === 0 ? "bg-dusty-cream" : "bg-sand/50"
                  }`}
                >
                  {row.map((cell) => (
                    <td
                      key={`${rowIndex}-${cell}`}
                      className="px-4 py-3 font-light text-text"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  );
}
