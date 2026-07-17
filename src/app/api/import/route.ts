import { NextResponse } from "next/server";
import {
  compliancePropertyLimitReached,
  PROPERTY_LIMIT_PROMPT,
} from "@/lib/entitlements";
import { parseImportCsv } from "@/lib/import";
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
  const { rows, errors } = parseImportCsv(content);

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid rows found in the file." },
      { status: 400 }
    );
  }

  const uniquePropertyCount = new Set(
    rows.map((row) => row.address.trim().toLowerCase())
  ).size;

  if (
    await compliancePropertyLimitReached(
      supabase,
      user.id,
      uniquePropertyCount
    )
  ) {
    return NextResponse.json(PROPERTY_LIMIT_PROMPT, { status: 403 });
  }

  const propertyIdsByAddress = new Map<string, string>();
  let propertiesCreated = 0;
  let certificatesCreated = 0;

  for (const row of rows) {
    const addressKey = row.address.trim().toLowerCase();
    let propertyId = propertyIdsByAddress.get(addressKey);

    if (!propertyId) {
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,
          address: row.address,
          property_type: row.property_type,
          bedrooms: row.bedrooms,
        })
        .select("id")
        .single();

      if (propertyError || !property) {
        return NextResponse.json(
          { error: propertyError?.message ?? "Failed to create property." },
          { status: 500 }
        );
      }

      propertyId = property.id as string;
      propertyIdsByAddress.set(addressKey, propertyId);
      propertiesCreated += 1;
    }

    if (
      row.certificate_type &&
      row.issue_date &&
      row.expiry_date
    ) {
      const { error: certificateError } = await supabase
        .from("certificates")
        .insert({
          property_id: propertyId,
          certificate_type: row.certificate_type,
          issue_date: row.issue_date,
          expiry_date: row.expiry_date,
        });

      if (certificateError) {
        return NextResponse.json(
          { error: certificateError.message },
          { status: 500 }
        );
      }

      certificatesCreated += 1;
    }
  }

  return NextResponse.json({
    propertiesCreated,
    certificatesCreated,
  });
}
