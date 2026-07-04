"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  btnDangerClassName,
  btnOutlineClassName,
  dashboardWarmCardClassName,
  linkClassName,
} from "@/lib/ui";
import { CERTIFICATE_LABELS, type Contractor } from "@/lib/types";

interface ContractorCardProps {
  contractor: Contractor;
}

export default function ContractorCard({ contractor }: ContractorCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        `Remove ${contractor.name} from your directory? They will be unlinked from all properties.`
      )
    ) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("contractors")
      .delete()
      .eq("id", contractor.id);

    setLoading(false);

    if (error) {
      window.alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <article className={`${dashboardWarmCardClassName} flex flex-col p-6 sm:p-8`}>
      <div className="dashboard-warm-card-content">
        <h2 className="font-serif text-xl tracking-wide text-text">{contractor.name}</h2>
        <p className="mt-2 text-base leading-relaxed text-leather">
          {contractor.company_name}
        </p>

        <div className="mt-5 space-y-1 text-base leading-relaxed">
          <a
            href={`tel:${contractor.phone.replace(/\s/g, "")}`}
            className={`${linkClassName} block`}
          >
            {contractor.phone}
          </a>
          <a href={`mailto:${contractor.email}`} className={`${linkClassName} block`}>
            {contractor.email}
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {contractor.certificate_types.map((type) => (
            <span
              key={type}
              className="border border-leather/20 bg-parchment-warm px-2.5 py-1 text-[11px] font-normal uppercase tracking-[0.12em] text-leather"
            >
              {CERTIFICATE_LABELS[type]}
            </span>
          ))}
        </div>
      </div>

      <div className="dashboard-warm-card-content mt-8 flex flex-wrap gap-3 border-t border-leather/15 pt-6">
        <Link
          href={`/contractors/${contractor.id}/edit`}
          className={`${btnOutlineClassName} px-4 py-2 text-sm`}
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className={`${btnDangerClassName} px-4 py-2 text-sm`}
        >
          {loading ? "Removing..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
