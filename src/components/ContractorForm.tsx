"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  capsLabelClassName,
  editorialFormCancelClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui";
import {
  CONTRACTOR_CERTIFICATE_CHECKLIST,
  type CertificateType,
  type Contractor,
} from "@/lib/types";

interface ContractorFormProps {
  contractor?: Contractor;
}

export default function ContractorForm({ contractor }: ContractorFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(contractor);

  const [name, setName] = useState(contractor?.name ?? "");
  const [companyName, setCompanyName] = useState(contractor?.company_name ?? "");
  const [phone, setPhone] = useState(contractor?.phone ?? "");
  const [email, setEmail] = useState(contractor?.email ?? "");
  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>(
    contractor?.certificate_types ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCertificateType(type: CertificateType) {
    setCertificateTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedCompany = companyName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedCompany || !trimmedPhone || !trimmedEmail) {
      setError("Please complete all contact fields.");
      return;
    }

    if (certificateTypes.length === 0) {
      setError("Select at least one certificate type.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to save a contractor.");
      setLoading(false);
      return;
    }

    const payload = {
      name: trimmedName,
      company_name: trimmedCompany,
      phone: trimmedPhone,
      email: trimmedEmail,
      certificate_types: certificateTypes,
      updated_at: new Date().toISOString(),
    };

    if (isEditing && contractor) {
      const { error: updateError } = await supabase
        .from("contractors")
        .update(payload)
        .eq("id", contractor.id);

      if (updateError) {
        setError(updateError.message);
        toastError();
        setLoading(false);
        return;
      }
      success("Contractor saved successfully");
    } else {
      const { error: insertError } = await supabase.from("contractors").insert({
        ...payload,
        user_id: user.id,
      });

      if (insertError) {
        setError(insertError.message);
        toastError();
        setLoading(false);
        return;
      }
      success("Contractor added");
    }

    router.push("/contractors");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="contractor-name" className={labelClassName}>
            Full Name
          </label>
          <input
            id="contractor-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="e.g. James Mitchell"
          />
        </div>

        <div>
          <label htmlFor="contractor-company" className={labelClassName}>
            Company Name
          </label>
          <input
            id="contractor-company"
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className={inputClassName}
            placeholder="e.g. Mitchell Gas Services Ltd"
          />
        </div>

        <div>
          <label htmlFor="contractor-phone" className={labelClassName}>
            Phone Number
          </label>
          <input
            id="contractor-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
            placeholder="e.g. 07700 900123"
          />
        </div>

        <div>
          <label htmlFor="contractor-email" className={labelClassName}>
            Email Address
          </label>
          <input
            id="contractor-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="e.g. james@mitchellgas.co.uk"
          />
        </div>
      </div>

      <div>
        <p className={labelClassName}>Certificate Types They Handle</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CONTRACTOR_CERTIFICATE_CHECKLIST.map((item) => {
            const checked = certificateTypes.includes(item.type);
            return (
              <label
                key={item.type}
                className={`flex min-h-11 cursor-pointer items-center gap-3 border px-4 py-3 transition ${
                  checked
                    ? "border-gold bg-parchment-warm/80"
                    : "border-taupe bg-dune hover:border-umber/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCertificateType(item.type)}
                  className="contractor-check h-4 w-4 shrink-0"
                />
                <span className={capsLabelClassName}>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`${btnPrimaryClassName} w-full sm:w-auto`}
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Save Contractor"
              : "Add Contractor"}
        </button>
        <Link href="/contractors" className={editorialFormCancelClassName}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
