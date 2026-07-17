import { NextResponse } from "next/server";
import {
  compliancePropertyLimitReached,
  PROPERTY_LIMIT_PROMPT,
} from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_TYPES, type PropertyType } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: {
    address?: string;
    propertyType?: string;
    bedrooms?: number;
    notes?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const address = payload.address?.trim();
  const propertyType = payload.propertyType as PropertyType | undefined;
  const bedrooms = Number(payload.bedrooms);

  if (
    !address ||
    !propertyType ||
    !PROPERTY_TYPES.includes(propertyType) ||
    !Number.isInteger(bedrooms) ||
    bedrooms < 1
  ) {
    return NextResponse.json(
      { error: "Valid property details are required." },
      { status: 400 }
    );
  }

  try {
    if (await compliancePropertyLimitReached(supabase, user.id)) {
      return NextResponse.json(PROPERTY_LIMIT_PROMPT, { status: 403 });
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        user_id: user.id,
        address,
        property_type: propertyType,
        bedrooms,
        notes: payload.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Unable to create property.");
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("[api/properties] Create failed:", error);
    return NextResponse.json(
      { error: "Unable to create property." },
      { status: 500 }
    );
  }
}
