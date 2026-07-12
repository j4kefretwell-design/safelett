import { notFound } from "next/navigation";
import TenancyNoticeDraftClient from "@/components/tenancy/TenancyNoticeDraftClient";
import { buildTenancyNoticeDraft } from "@/lib/tenancy-notices";
import type { Tenancy } from "@/lib/tenancy";
import { getUserProfile } from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";

interface DraftNoticePageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftNoticePage({ params }: DraftNoticePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: tenancy } = await supabase
    .from("tenancies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!tenancy) {
    notFound();
  }

  const profile = await getUserProfile(supabase, user.id);
  const userName = profile.full_name?.trim() || "Property Manager";
  const record = tenancy as Tenancy;

  const drafts = {
    renewal_offer: buildTenancyNoticeDraft({
      noticeType: "renewal_offer",
      tenancy: record,
      userName,
    }),
    rent_increase: buildTenancyNoticeDraft({
      noticeType: "rent_increase",
      tenancy: record,
      userName,
      proposedRent: Number(record.monthly_rent) * 1.05,
    }),
    end_of_tenancy: buildTenancyNoticeDraft({
      noticeType: "end_of_tenancy",
      tenancy: record,
      userName,
    }),
    right_to_rent_reminder: buildTenancyNoticeDraft({
      noticeType: "right_to_rent_reminder",
      tenancy: record,
      userName,
    }),
  };

  return (
    <TenancyNoticeDraftClient
      drafts={drafts}
      tenantNames={record.tenant_names}
      propertyAddress={record.property_address}
      backHref={`/tenancy/${record.id}`}
    />
  );
}
