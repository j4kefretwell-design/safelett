import Link from "next/link";
import { notFound } from "next/navigation";
import BackgroundImage from "@/components/BackgroundImage";
import ContractorForm from "@/components/ContractorForm";
import { AnimateIn } from "@/components/AnimateIn";
import { siteImages } from "@/lib/site-images";
import { createClient } from "@/lib/supabase/server";
import type { Contractor } from "@/lib/types";

interface EditContractorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContractorPage({ params }: EditContractorPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contractor } = await supabase
    .from("contractors")
    .select("*")
    .eq("id", id)
    .single();

  if (!contractor) {
    notFound();
  }

  return (
    <AnimateIn>
      <div className="grid min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden lg:grid-cols-[2fr_3fr]">
        <div
          className="relative hidden min-h-[480px] lg:block lg:min-h-full"
          style={{ backgroundColor: siteImages.bradStarkey.placeholderColor }}
        >
          <BackgroundImage
            image={siteImages.bradStarkey}
            alt=""
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            effect="fade"
          />
          <div className="absolute inset-0 bg-espresso/65" />
        </div>

        <div className="flex w-full flex-col bg-vanilla px-5 py-12 sm:px-12 lg:px-16 lg:py-20 xl:px-20">
          <Link
            href="/contractors"
            className="text-base font-light leading-relaxed text-leather transition hover:text-text"
          >
            ← Back to Contractors
          </Link>

          <p className="mt-8 text-[10px] font-normal uppercase tracking-[0.32em] text-gold-readable">
            Contractors Directory
          </p>
          <h1 className="mt-5 max-w-xl font-serif text-3xl tracking-wide text-heading sm:text-4xl">
            Edit Contractor
          </h1>
          <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-leather">
            Update contact details or the certificate types this contractor
            handles.
          </p>

          <ContractorForm contractor={contractor as Contractor} />
        </div>
      </div>
    </AnimateIn>
  );
}
