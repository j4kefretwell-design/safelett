"use client";

import { useState } from "react";
import { btnOutlineClassName, btnReportOutlineClassName } from "@/lib/ui";
import type { AnnualReportData } from "@/lib/annual-report";

export default function DashboardPortfolioActions() {
  const [exportingCsv, setExportingCsv] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  async function handleExportCsv() {
    setExportingCsv(true);

    try {
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fretwell-co-compliance-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      window.alert("Unable to export compliance data. Please try again.");
    } finally {
      setExportingCsv(false);
    }
  }

  async function handleGenerateReport() {
    setGeneratingReport(true);

    try {
      const response = await fetch("/api/annual-report");
      if (!response.ok) {
        throw new Error("Report generation failed");
      }

      const data = (await response.json()) as AnnualReportData;
      const { generateAnnualReportPdf } = await import("@/lib/annual-report-pdf");
      generateAnnualReportPdf(data);
    } catch {
      window.alert("Unable to generate annual report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        onClick={handleExportCsv}
        disabled={exportingCsv || generatingReport}
        className={`${btnOutlineClassName} min-h-9 px-4 py-2 text-[11px] tracking-[0.1em]`}
      >
        {exportingCsv ? "Exporting..." : "Export CSV"}
      </button>
      <button
        type="button"
        onClick={handleGenerateReport}
        disabled={exportingCsv || generatingReport}
        className={btnReportOutlineClassName}
      >
        {generatingReport ? "Generating..." : "Generate Annual Report"}
      </button>
    </div>
  );
}
