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
          <p className="mt-8 text-[10px] font-normal uppercase tracking-[0.32em] text-gold-readable">
            Add a Tenancy
          </p>
          <h1 className="mt-4 font-serif text-3xl tracking-wide text-umber sm:text-4xl">
            Record a New Tenancy
          </h1>
          <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-leather">
            Start with the essentials — you can add deposit and right to rent
            details in the next step, or skip them for now.
          </p>

          <div className="mt-12">
            <AddTenancyWizard properties={(properties ?? []) as Property[]} />
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}
