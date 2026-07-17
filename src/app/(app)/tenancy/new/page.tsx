import PageBackLink from "@/components/PageBackLink";
import AddTenancyWizard from "@/components/tenancy/AddTenancyWizard";
import { AnimateIn } from "@/components/AnimateIn";
import { appUnderNavClassName } from "@/lib/ui";
import type { Property } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function NewTenancyPage() {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("address");

  return (
    <AnimateIn>
      <div className={`min-h-screen w-full bg-greige ${appUnderNavClassName}`}>
        <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <PageBackLink href="/tenancy/dashboard">← Back to Tenancy</PageBackLink>
          <h1 className="mt-8 text-[10px] font-normal uppercase tracking-[0.32em] text-heading">
            Add Tenancy
          </h1>

          <div className="mt-10">
            <AddTenancyWizard properties={(properties ?? []) as Property[]} />
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}
