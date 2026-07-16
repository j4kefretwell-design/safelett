import Link from "next/link";
import TenantCard from "@/components/tenancy/TenantCard";
import TenantsEmptyState from "@/components/tenancy/TenantsEmptyState";
import { createClient } from "@/lib/supabase/server";
import type { Tenant } from "@/lib/tenants";
import type { Tenancy } from "@/lib/tenancy";
import type { Property } from "@/lib/types";
import {
  btnNavyOutlineClassName,
  capsLabelClassName,
  editorialPagePaddingClassName,
  appUnderNavClassName,
} from "@/lib/ui";

export const revalidate = 30;

export default async function TenantsPage() {
  const supabase = await createClient();

  const [{ data: tenants }, { data: properties }, { data: tenancies }] =
    await Promise.all([
      supabase.from("tenants").select("*").order("full_name", { ascending: true }),
      supabase.from("properties").select("id, address"),
      supabase.from("tenancies").select("*"),
    ]);

  const tenantList = (tenants ?? []) as Tenant[];
  const propertyById = new Map(
    ((properties ?? []) as Pick<Property, "id" | "address">[]).map((property) => [
      property.id,
      property.address,
    ])
  );
  const tenancyById = new Map(
    ((tenancies ?? []) as Tenancy[]).map((tenancy) => [tenancy.id, tenancy])
  );

  return (
    <div className="tenancy-slate-bg min-h-screen w-full min-w-0 overflow-x-hidden">
      <section
        className={`${appUnderNavClassName} bg-navy px-5 pb-12 text-center sm:px-12 lg:px-16`}
      >
        <p className={`${capsLabelClassName} text-dusty-cream`}>Tenants</p>
        <p className="mt-3 text-sm italic leading-relaxed text-dusty-cream/85">
          Manage your tenant contacts and information
        </p>
      </section>

      {tenantList.length === 0 ? (
        <TenantsEmptyState />
      ) : (
        <section className={`${editorialPagePaddingClassName} py-10 sm:py-12`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-light leading-relaxed text-steel">
              {tenantList.length}{" "}
              {tenantList.length === 1 ? "tenant" : "tenants"} in your directory
            </p>
            <Link
              href="/tenancy/tenants/new"
              className={`${btnNavyOutlineClassName} w-full sm:w-auto`}
            >
              Add Tenant +
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tenantList.map((tenant) => {
              const tenancy = tenant.tenancy_id
                ? tenancyById.get(tenant.tenancy_id) ?? null
                : null;
              const propertyAddress = tenant.property_id
                ? propertyById.get(tenant.property_id) ?? null
                : null;

              return (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  propertyAddress={propertyAddress}
                  tenancy={tenancy}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
