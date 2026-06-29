import { NextResponse } from "next/server";
import { buildComplianceCsv, buildExportRows } from "@/lib/export";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("address", { ascending: true });

  const propertyList = (properties ?? []) as Property[];
  const certificatesByProperty = new Map<string, Certificate[]>();

  for (const property of propertyList) {
    const { data: certificates } = await supabase
      .from("certificates")
      .select("*")
      .eq("property_id", property.id)
      .order("expiry_date", { ascending: true });

    certificatesByProperty.set(
      property.id,
      (certificates ?? []) as Certificate[]
    );
  }

  const rows = buildExportRows(propertyList, certificatesByProperty);
  const csv = buildComplianceCsv(rows);
  const filename = `fretwell-co-compliance-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
