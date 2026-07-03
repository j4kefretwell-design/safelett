"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  goldLabelClassName,
  mutedTextClassName,
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
    body: "Drop your completed file here and we will add everything to your portfolio.",
  },
];

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
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <ScrollRevealGroup className="space-y-12">
        {steps.map((step) => (
          <div key={step.number}>
            <p className="text-sm font-light tracking-[0.2em] text-gold">
              {step.number}
            </p>
            <div className="mt-4 h-px w-12 bg-gold/60" aria-hidden="true" />
            <h2 className="mt-6 font-serif text-xl tracking-wide text-text">
              {step.title}
            </h2>
            <p className={`${mutedTextClassName} mt-3`}>{step.body}</p>
            {step.number === "01" && (
              <a
                href={templateUrl}
                download="fretwell-co-import-template.csv"
                className={`${btnOutlineClassName} mt-6 inline-flex`}
              >
                Download Template
              </a>
            )}
          </div>
        ))}
      </ScrollRevealGroup>

      <AnimateIn delay={100}>
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <label
            htmlFor="csv-upload"
            className="flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-cocoa/30 bg-beige px-8 py-16 text-center transition hover:border-cocoa/50 hover:bg-beige/80"
          >
            <Upload className="h-8 w-8 text-cocoa/40" strokeWidth={1.25} />
            <p className="mt-6 font-serif text-xl tracking-wide text-text">
              Drop your CSV here
            </p>
            <p className="mt-2 text-sm font-light italic text-cocoa">
              or browse to select a file
            </p>
            {file && (
              <p className={`${goldLabelClassName} mt-6`}>{file.name}</p>
            )}
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>

          {error && (
            <p className="mt-6 border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
              {error}
            </p>
          )}

          {result && (
            <p className="mt-6 border border-compliant/20 bg-compliant-light px-4 py-3 text-sm text-compliant">
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
            className={`${btnPrimaryClassName} mt-8 w-full`}
          >
            {loading ? "Importing..." : "Import Properties"}
          </button>
        </form>
      </AnimateIn>
    </div>
  );
}
