import { notFound } from "next/navigation";
import BackgroundImage from "@/components/BackgroundImage";
import PageBackLink from "@/components/PageBackLink";
import TenantForm from "@/components/tenancy/TenantForm";
import { AnimateIn } from "@/components/AnimateIn";
import { siteImages } from "@/lib/site-images";
import { createClient } from "@/lib/supabase/server";
import type { Tenant } from "@/lib/tenants";
import type { Tenancy } from "@/lib/tenancy";
import type { Property } from "@/lib/types";

interface EditTenantPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTenantPage({ params }: EditTenantPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tenant }, { data: properties }, { data: tenancies }] =
    await Promise.all([
      supabase.from("tenants").select("*").eq("id", id).maybeSingle(),
      supabase.from("properties").select("*").order("address", { ascending: true }),
      supabase.from("tenancies").select("*").order("end_date", { ascending: true }),
    ]);

  if (!tenant) {
    notFound();
  }

  return (
    <AnimateIn>
      <div className="grid w-full lg:grid-cols-[2fr_3fr]">
        <div
          className="relative hidden lg:sticky lg:top-0 lg:block lg:h-[calc(100vh-4rem)] lg:self-start"
          style={{ backgroundColor: siteImages.eranjanCottage.placeholderColor }}
        >
          <BackgroundImage
            image={siteImages.eranjanCottage}
            alt=""
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            effect="fade"
          />
          <div className="absolute inset-0 bg-navy/70" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 xl:p-16">
            <blockquote className="max-w-sm">
              <p className="font-serif text-2xl leading-snug tracking-wide text-dusty-cream lg:text-3xl">
                &ldquo;Keep every contact current.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>

        <div className="flex w-full flex-col bg-vanilla px-8 py-14 sm:px-12 lg:px-16 lg:py-20 xl:px-20">
          <PageBackLink href={`/tenancy/tenants/${id}`}>
            ← Back to Tenant
          </PageBackLink>
          <p className="mt-8 text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
            Edit Tenant
          </p>
          <h1 className="mt-5 max-w-xl font-serif text-3xl tracking-wide text-heading sm:text-4xl">
            Update Tenant Details
          </h1>

          <div className="mt-14 flex-1">
            <TenantForm
              tenant={tenant as Tenant}
              properties={(properties ?? []) as Property[]}
              tenancies={(tenancies ?? []) as Tenancy[]}
            />
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}
