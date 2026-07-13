import { NextResponse } from "next/server";
import { parseTenancyImportCsv } from "@/lib/tenancy-import";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const content = await file.text();
  const { rows, errors } = parseTenancyImportCsv(content);

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid rows found in the file." },
      { status: 400 }
    );
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("id, address")
    .eq("user_id", user.id);

  const propertyIdByAddress = new Map(
    (properties ?? []).map((property) => [
      String(property.address).trim().toLowerCase(),
      property.id as string,
    ])
  );

  let tenanciesCreated = 0;
  const importErrors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const propertyId =
      propertyIdByAddress.get(row.property_address.trim().toLowerCase()) ?? null;

    const { error } = await supabase.from("tenancies").insert({
      user_id: user.id,
      tenant_names: row.tenant_names,
      property_address: row.property_address,
      property_id: propertyId,
      tenancy_type: row.tenancy_type,
      start_date: row.start_date,
      end_date: row.end_date,
      monthly_rent: row.monthly_rent,
      rent_review_date: row.rent_review_date,
      deposit_amount: row.deposit_amount,
      deposit_scheme: row.deposit_scheme,
      deposit_protection_date: row.deposit_protection_date,
      right_to_rent_checked: Boolean(row.right_to_rent_expiry),
      right_to_rent_expiry: row.right_to_rent_expiry,
    });

    if (error) {
      importErrors.push(`Row ${index + 2}: ${error.message}`);
      continue;
    }

    tenanciesCreated += 1;
  }

  if (tenanciesCreated === 0 && importErrors.length > 0) {
    return NextResponse.json({ errors: importErrors }, { status: 400 });
  }

  return NextResponse.json({
    tenanciesCreated,
    errors: importErrors,
  });
}
