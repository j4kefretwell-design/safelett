import { NextResponse } from "next/server";
import { buildAnnualReportData } from "@/lib/annual-report";
import { resolveUserDisplayName } from "@/lib/contractor-email";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/user-profile";
import type {
  Certificate,
  Property,
  PropertyContractorWithDetails,
} from "@/lib/types";

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
  const contractorsByProperty = new Map<string, PropertyContractorWithDetails[]>();

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

    const { data: assignments } = await supabase
      .from("property_contractors")
      .select("*, contractors(*)")
      .eq("property_id", property.id)
      .order("certificate_type", { ascending: true });

    contractorsByProperty.set(
      property.id,
      (assignments ?? []) as PropertyContractorWithDetails[]
    );
  }

  const profile = await getUserProfile(supabase, user.id);
  const preparedFor =
    resolveUserDisplayName(profile.full_name) ||
    user.email ||
    "Property Manager";

  const report = buildAnnualReportData({
    properties: propertyList,
    certificatesByProperty,
    contractorsByProperty,
    preparedFor,
  });

  return NextResponse.json(report);
}
