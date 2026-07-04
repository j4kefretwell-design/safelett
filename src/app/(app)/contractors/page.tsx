import Link from "next/link";
import ContractorCard from "@/components/ContractorCard";
import { btnPrimaryClassName, capsLabelClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Contractor } from "@/lib/types";

export default async function ContractorsPage() {
  const supabase = await createClient();

  const { data: contractors } = await supabase
    .from("contractors")
    .select("*")
    .order("name", { ascending: true });

  const contractorList = (contractors ?? []) as Contractor[];

  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden">
      <section className="dashboard-portfolio-divider flex flex-col items-center justify-center px-5 py-10 text-center">
        <p className={capsLabelClassName}>Contractors</p>
        <p className="mt-3 text-base italic leading-relaxed text-dusty-cream/90">
          Manage your trusted contractors
        </p>
      </section>

      <section className="px-5 py-10 sm:px-12 sm:py-12 lg:px-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base leading-relaxed text-leather">
            {contractorList.length}{" "}
            {contractorList.length === 1 ? "contractor" : "contractors"} in your
            directory
          </p>
          <Link href="/contractors/new" className={`${btnPrimaryClassName} w-full sm:w-auto`}>
            Add Contractor +
          </Link>
        </div>

        {contractorList.length === 0 ? (
          <div className="mt-12 border border-leather/20 bg-white px-8 py-16 text-center">
            <p className="font-serif text-2xl tracking-wide text-text">
              No contractors yet
            </p>
            <p className="mt-4 text-base leading-relaxed text-leather">
              Add your trusted tradespeople once, then link them to any property.
            </p>
            <Link href="/contractors/new" className={`${btnPrimaryClassName} mt-8 inline-flex`}>
              Add Contractor +
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {contractorList.map((contractor) => (
              <ContractorCard key={contractor.id} contractor={contractor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
