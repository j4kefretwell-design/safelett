import { NextResponse } from "next/server";
import { buildTenancyImportTemplateCsv } from "@/lib/tenancy-import";

export async function GET() {
  const csv = buildTenancyImportTemplateCsv();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="fretwell-co-tenancy-import-template.csv"',
    },
  });
}
