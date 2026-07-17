import Link from "next/link";
import { notFound } from "next/navigation";
import PageBackLink from "@/components/PageBackLink";
import DeleteTenancyButton from "@/components/tenancy/DeleteTenancyButton";
import TenancyTimeline from "@/components/tenancy/TenancyTimeline";
import { AnimateIn } from "@/components/AnimateIn";
import {
  DEPOSIT_SCHEME_LABELS,
  formatCurrency,
  formatTenancyDate,
  getDateCardStatus,
  getDaysUntilDate,
  getTenancyStatus,
  hasMissingTenancyOptionalDetails,
  isDepositProtectionOverdue,
  TENANCY_STATUS_LABELS,
  TENANCY_TYPE_LABELS,
  type Tenancy,
} from "@/lib/tenancy";
import { getTenancyDocumentUrl } from "@/lib/tenancy-documents";
import { btnPrimaryClassName, capsLabelClassName, appUnderNavClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";

interface TenancyDetailPageProps {
  params: Promise<{ id: string }>;
}

function DateCard({
  label,
  date,
  daysRemaining,
}: {
  label: string;
  date: string | null;
  daysRemaining: number | null;
}) {
  if (!date) {
    return (
      <div className="border border-taupe bg-dune px-5 py-4">
        <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-steel">
          {label}
        </p>
        <p className="mt-2 text-sm text-steel/70">Not recorded</p>
      </div>
    );
  }

  const status = daysRemaining == null ? "green" : getDateCardStatus(daysRemaining);
  const statusClass =
    status === "red"
      ? "text-urgent"
      : status === "amber"
        ? "text-attention"
        : "text-compliant";

  return (
    <div className="border border-taupe bg-dune px-5 py-4">
      <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-steel">
        {label}
      </p>
      <p className="mt-2 font-serif text-lg tracking-wide text-tenancy-text">
        {formatTenancyDate(date)}
      </p>
      {daysRemaining != null && (
        <p className={`mt-1 text-sm ${statusClass}`}>
          {daysRemaining < 0
            ? `${Math.abs(daysRemaining)} days overdue`
            : `${daysRemaining} days remaining`}
        </p>
      )}
    </div>
  );
}

export default async function TenancyDetailPage({ params }: TenancyDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tenancy } = await supabase
    .from("tenancies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!tenancy) {
    notFound();
  }

  const record = tenancy as Tenancy;
  const status = getTenancyStatus(record);
  const depositOverdue = isDepositProtectionOverdue(record);
  const showMissingDetailsBanner = hasMissingTenancyOptionalDetails(record);

  const [agreementUrl, depositCertUrl, rightToRentUrl] = await Promise.all([
    record.agreement_path
      ? getTenancyDocumentUrl(supabase, record.agreement_path)
      : null,
    record.deposit_cert_path
      ? getTenancyDocumentUrl(supabase, record.deposit_cert_path)
      : null,
    record.right_to_rent_path
      ? getTenancyDocumentUrl(supabase, record.right_to_rent_path)
      : null,
  ]);

  const documents = [
    { label: "Tenancy Agreement", url: agreementUrl },
    { label: "Deposit Certificate", url: depositCertUrl },
    { label: "Right to Rent Documents", url: rightToRentUrl },
  ];

  return (
    <div className="tenancy-slate-bg min-h-screen">
      <section className={`${appUnderNavClassName} bg-navy px-5 pb-12 sm:px-12 lg:px-16`}>
        <AnimateIn>
          <PageBackLink href="/tenancy/dashboard" className="text-gold">
            ← Back to Tenancy
          </PageBackLink>
          <p className={`${capsLabelClassName} mt-8`}>Tenancy Record</p>
          <h1 className="mt-4 font-serif text-3xl tracking-wide text-dusty-cream sm:text-4xl">
            {record.tenant_names}
          </h1>
          <p className="mt-3 text-base font-light text-dusty-cream/85">
            {record.property_address}
          </p>
          <p className="mt-4 text-xs font-normal uppercase tracking-[0.14em] text-gold">
            {TENANCY_STATUS_LABELS[status]}
          </p>
        </AnimateIn>
      </section>

      {showMissingDetailsBanner ? (
        <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-12 lg:px-16">
          <AnimateIn delay={50}>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-navy px-5 py-4 sm:px-6">
              <p className="text-sm leading-relaxed text-dusty-cream/90">
                Some details are missing. Add deposit and right to rent information.
              </p>
              <Link
                href={`/tenancy/${record.id}/edit`}
                className="shrink-0 text-sm text-gold transition hover:opacity-80"
              >
                Add missing details →
              </Link>
            </div>
          </AnimateIn>
        </section>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-14">
        <AnimateIn delay={100}>
          <div className="border border-taupe bg-dune p-6 sm:p-8">
            <h2 className="font-serif text-xl tracking-wide text-tenancy-text">
              Tenancy Details
            </h2>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="text-steel">Tenancy Type</dt>
                <dd className="mt-1 text-tenancy-text">
                  {TENANCY_TYPE_LABELS[record.tenancy_type]}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Monthly Rent</dt>
                <dd className="mt-1 font-serif text-lg text-tenancy-text">
                  {formatCurrency(Number(record.monthly_rent))}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Tenancy Period</dt>
                <dd className="mt-1 text-tenancy-text">
                  {formatTenancyDate(record.start_date)} —{" "}
                  {formatTenancyDate(record.end_date)}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Deposit</dt>
                <dd className="mt-1 text-tenancy-text">
                  {record.deposit_amount != null
                    ? `${formatCurrency(Number(record.deposit_amount))} · ${record.deposit_scheme ? DEPOSIT_SCHEME_LABELS[record.deposit_scheme] : "—"}`
                    : "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-steel">Right to Rent</dt>
                <dd className="mt-1 text-tenancy-text">
                  {record.right_to_rent_checked ? "Completed" : "Not completed"}
                </dd>
              </div>
            </dl>

            {depositOverdue && (
              <p className="mt-6 border border-urgent/20 bg-urgent-light/40 px-4 py-3 text-sm text-urgent">
                Deposit Protection Overdue — protection was not registered within
                30 days of the tenancy start date.
              </p>
            )}
          </div>
        </AnimateIn>

        <AnimateIn delay={150}>
          <div className="border border-taupe bg-dune p-6 sm:p-8">
            <h2 className="font-serif text-xl tracking-wide text-tenancy-text">
              Documents
            </h2>
            <ul className="mt-8 space-y-4">
              {documents.map((document) => (
                <li
                  key={document.label}
                  className="flex items-center justify-between gap-4 border-b border-steel/10 pb-4"
                >
                  <span className="text-sm text-tenancy-text">{document.label}</span>
                  {document.url ? (
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-navy underline-offset-4 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-sm text-steel/70">Not uploaded</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </AnimateIn>
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-12 lg:px-16">
        <AnimateIn delay={200}>
          <h2 className="font-serif text-xl tracking-wide text-tenancy-text">
            Key Dates
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DateCard
              label="Tenancy End"
              date={record.end_date}
              daysRemaining={getDaysUntilDate(record.end_date)}
            />
            <DateCard
              label="Rent Review"
              date={record.rent_review_date}
              daysRemaining={
                record.rent_review_date
                  ? getDaysUntilDate(record.rent_review_date)
                  : null
              }
            />
            <DateCard
              label="Deposit Protection"
              date={record.deposit_protection_date}
              daysRemaining={null}
            />
            <DateCard
              label="Right to Rent Expiry"
              date={record.right_to_rent_expiry}
              daysRemaining={
                record.right_to_rent_expiry
                  ? getDaysUntilDate(record.right_to_rent_expiry)
                  : null
              }
            />
          </div>
        </AnimateIn>
      </section>

      <AnimateIn delay={220}>
        <TenancyTimeline tenancy={record} />
      </AnimateIn>

      {record.notes && (
        <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-12 lg:px-16">
          <AnimateIn delay={250}>
            <div className="border border-taupe bg-dune p-6 sm:p-8">
              <h2 className="font-serif text-xl tracking-wide text-tenancy-text">
                Notes
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-steel">
                {record.notes}
              </p>
            </div>
          </AnimateIn>
        </section>
      )}

      <section className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pb-16 sm:flex-row sm:flex-wrap sm:items-center sm:px-12 lg:px-16">
        <Link
          href={`/tenancy/${record.id}/draft-notice`}
          className={`${btnPrimaryClassName} bg-navy hover:bg-navy-dark`}
        >
          Generate Tenancy Notice
        </Link>
        <Link
          href={`/tenancy/${record.id}/edit`}
          className="inline-flex min-h-11 items-center justify-center border border-steel/35 px-6 py-3 text-sm uppercase tracking-[0.1em] text-steel transition hover:border-navy hover:text-navy"
        >
          Edit
        </Link>
        <DeleteTenancyButton tenancyId={record.id} />
      </section>
    </div>
  );
}
