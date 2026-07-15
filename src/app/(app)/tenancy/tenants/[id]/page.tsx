import Link from "next/link";
import { notFound } from "next/navigation";
import PageBackLink from "@/components/PageBackLink";
import DeleteTenantButton from "@/components/tenancy/DeleteTenantButton";
import { AnimateIn } from "@/components/AnimateIn";
import {
  getTenantStatus,
  getTenantTenancyTypeLabel,
  TENANT_STATUS_LABELS,
  type Tenant,
} from "@/lib/tenants";
import {
  formatTenancyDate,
  TENANCY_TYPE_LABELS,
  type Tenancy,
} from "@/lib/tenancy";
import { getTenancyDocumentUrl } from "@/lib/tenancy-documents";
import { btnNavyOutlineClassName, capsLabelClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";

interface TenantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!tenant) {
    notFound();
  }

  const record = tenant as Tenant;

  const [{ data: property }, { data: tenancy }] = await Promise.all([
    record.property_id
      ? supabase
          .from("properties")
          .select("id, address")
          .eq("id", record.property_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    record.tenancy_id
      ? supabase
          .from("tenancies")
          .select("*")
          .eq("id", record.tenancy_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const linkedProperty = property as Pick<Property, "id" | "address"> | null;
  const linkedTenancy = tenancy as Tenancy | null;
  const status = getTenantStatus(linkedTenancy);

  const rightToRentUrl = linkedTenancy?.right_to_rent_path
    ? await getTenancyDocumentUrl(supabase, linkedTenancy.right_to_rent_path)
    : null;
  const agreementUrl = linkedTenancy?.agreement_path
    ? await getTenancyDocumentUrl(supabase, linkedTenancy.agreement_path)
    : null;
  const depositCertUrl = linkedTenancy?.deposit_cert_path
    ? await getTenancyDocumentUrl(supabase, linkedTenancy.deposit_cert_path)
    : null;

  const documents = [
    { label: "Right to Rent Documents", url: rightToRentUrl },
    { label: "Tenancy Agreement", url: agreementUrl },
    { label: "Deposit Certificate", url: depositCertUrl },
  ].filter((document) => document.url);

  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)]">
      <section className="bg-navy px-5 py-12 sm:px-12 lg:px-16">
        <AnimateIn>
          <PageBackLink href="/tenancy/tenants" className="text-gold">
            ← Back to Tenants
          </PageBackLink>
          <p className={`${capsLabelClassName} mt-8 text-dusty-cream`}>Tenant</p>
          <h1 className="mt-4 font-serif text-3xl tracking-wide text-dusty-cream sm:text-4xl">
            {record.full_name}
          </h1>
          <p className="mt-3 text-base font-light text-dusty-cream/85">
            {linkedProperty?.address ??
              linkedTenancy?.property_address ??
              "No property linked"}
          </p>
          <p className="mt-4 text-xs font-normal uppercase tracking-[0.14em] text-gold">
            {TENANT_STATUS_LABELS[status]}
          </p>
        </AnimateIn>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-14">
        <AnimateIn delay={100}>
          <div className="border border-steel/15 bg-white p-6 sm:p-8">
            <h2 className="font-serif text-xl tracking-wide text-tenancy-text">
              Tenant Details
            </h2>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="text-steel">Email</dt>
                <dd className="mt-1 text-tenancy-text">
                  {record.email ?? "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Phone</dt>
                <dd className="mt-1 text-tenancy-text">
                  {record.phone ?? "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Move In Date</dt>
                <dd className="mt-1 text-tenancy-text">
                  {record.move_in_date
                    ? formatTenancyDate(record.move_in_date)
                    : "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Linked Property</dt>
                <dd className="mt-1 text-tenancy-text">
                  {linkedProperty?.address ??
                    linkedTenancy?.property_address ??
                    "None"}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Tenancy Type</dt>
                <dd className="mt-1 text-tenancy-text">
                  {getTenantTenancyTypeLabel(linkedTenancy)}
                </dd>
              </div>
            </dl>

            {record.notes ? (
              <div className="mt-8 border-t border-steel/15 pt-6">
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-steel">
                  Notes
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-tenancy-text">
                  {record.notes}
                </p>
              </div>
            ) : null}
          </div>
        </AnimateIn>

        <AnimateIn delay={180}>
          <div className="border border-steel/15 bg-white p-6 sm:p-8">
            <h2 className="font-serif text-xl tracking-wide text-tenancy-text">
              Linked Tenancy
            </h2>
            {linkedTenancy ? (
              <div className="mt-8 space-y-4 text-sm">
                <p className="text-tenancy-text">
                  {linkedTenancy.tenant_names}
                </p>
                <p className="text-steel">{linkedTenancy.property_address}</p>
                <p className="text-steel">
                  {TENANCY_TYPE_LABELS[linkedTenancy.tenancy_type]} ·{" "}
                  {formatTenancyDate(linkedTenancy.start_date)} —{" "}
                  {formatTenancyDate(linkedTenancy.end_date)}
                </p>
                <Link
                  href={`/tenancy/${linkedTenancy.id}`}
                  className="inline-block text-sm text-navy transition hover:underline"
                >
                  View tenancy record →
                </Link>
              </div>
            ) : (
              <p className="mt-8 text-sm text-steel">
                No tenancy is linked to this tenant contact.
              </p>
            )}

            <div className="mt-10 border-t border-steel/15 pt-6">
              <h3 className="font-serif text-lg tracking-wide text-tenancy-text">
                Documents
              </h3>
              {documents.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {documents.map((document) => (
                    <li key={document.label}>
                      <a
                        href={document.url!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-navy transition hover:underline"
                      >
                        {document.label} →
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-steel">
                  No right to rent or tenancy documents available. Link a
                  tenancy with uploaded documents to see them here.
                </p>
              )}
            </div>
          </div>
        </AnimateIn>
      </div>

      <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 pb-16 sm:px-12 lg:px-16">
        <Link
          href={`/tenancy/tenants/${record.id}/edit`}
          className={btnNavyOutlineClassName}
        >
          Edit Tenant
        </Link>
        <DeleteTenantButton tenantId={record.id} />
      </section>
    </div>
  );
}
