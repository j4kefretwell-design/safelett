import { buildImportTemplateCsv } from "@/lib/import";

export async function GET() {
  const csv = buildImportTemplateCsv();

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="safelett-import-template.csv"',
    },
  });
}
