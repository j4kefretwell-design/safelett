import { notFound } from "next/navigation";
import PageBackLink from "@/components/PageBackLink";
import TenancyForm from "@/components/tenancy/TenancyForm";
import { AnimateIn } from "@/components/AnimateIn";
import { appUnderNavClassName } from "@/lib/ui";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";
import { createClient } from "@/lib/supabase/server";

interface EditTenancyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTenancyPage({ params }: EditTenancyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tenancy }, { data: properties }] = await Promise.all([
    supabase.from("tenancies").select("*").eq("id", id).maybeSingle(),
    supabase.from("properties").select("*").order("address"),
  ]);

  if (!tenancy) {
    notFound();
  }

  return (
    <AnimateIn>
      <div className={`tenancy-slate-bg min-h-screen px-5 pb-12 sm:px-12 lg:px-16 ${appUnderNavClassName}`}>
        <PageBackLink href={`/tenancy/${id}`}>← Back to Tenancy</PageBackLink>
        <p className="mt-8 text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
          Edit Tenancy
        </p>
        <h1 className="mt-5 font-serif text-3xl tracking-wide text-tenancy-text sm:text-4xl">
          Update Tenancy Record
        </h1>
        <div className="mt-12 max-w-3xl border border-taupe bg-vanilla p-6 sm:p-10">
          <TenancyForm
            tenancy={tenancy as Tenancy}
            properties={(properties ?? []) as Property[]}
          />
        </div>
      </div>
    </AnimateIn>
  );
}
