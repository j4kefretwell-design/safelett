"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import type { Tenant } from "@/lib/tenants";
import type { Tenancy } from "@/lib/tenancy";
import type { Property } from "@/lib/types";
import {
  btnNavyClassName,
  editorialFormCancelClassName,
  inputClassName,
  labelClassName,
  selectClassName,
  textareaClassName,
} from "@/lib/ui";
import Link from "next/link";

interface TenantFormProps {
  tenant?: Tenant;
  properties?: Property[];
  tenancies?: Tenancy[];
}

export default function TenantForm({
  tenant,
  properties: initialProperties = [],
  tenancies: initialTenancies = [],
}: TenantFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(tenant);

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [tenancies, setTenancies] = useState<Tenancy[]>(initialTenancies);
  const [fullName, setFullName] = useState(tenant?.full_name ?? "");
  const [email, setEmail] = useState(tenant?.email ?? "");
  const [phone, setPhone] = useState(tenant?.phone ?? "");
  const [propertyId, setPropertyId] = useState(tenant?.property_id ?? "");
  const [tenancyId, setTenancyId] = useState(tenant?.tenancy_id ?? "");
  const [moveInDate, setMoveInDate] = useState(tenant?.move_in_date ?? "");
  const [notes, setNotes] = useState(tenant?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProperties.length > 0 && initialTenancies.length > 0) return;

    async function load() {
      const supabase = createClient();
      const [{ data: propertyRows }, { data: tenancyRows }] = await Promise.all([
        supabase.from("properties").select("*").order("address", { ascending: true }),
        supabase.from("tenancies").select("*").order("end_date", { ascending: true }),
      ]);
      if (propertyRows) setProperties(propertyRows as Property[]);
      if (tenancyRows) setTenancies(tenancyRows as Tenancy[]);
    }

    void load();
  }, [initialProperties.length, initialTenancies.length]);

  const linkedTenancies = useMemo(() => {
    if (!propertyId) return tenancies;
    return tenancies.filter(
      (item) =>
        item.property_id === propertyId ||
        properties
          .find((property) => property.id === propertyId)
          ?.address.trim()
          .toLowerCase() === item.property_address.trim().toLowerCase()
    );
  }, [propertyId, tenancies, properties]);

  useEffect(() => {
    if (!tenancyId) return;
    if (linkedTenancies.some((item) => item.id === tenancyId)) return;
    setTenancyId("");
  }, [linkedTenancies, tenancyId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      property_id: propertyId || null,
      tenancy_id: tenancyId || null,
      move_in_date: moveInDate || null,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditing && tenant) {
        const { error: updateError } = await supabase
          .from("tenants")
          .update(payload)
          .eq("id", tenant.id);
        if (updateError) throw updateError;
        success("Tenant updated");
        router.push(`/tenancy/tenants/${tenant.id}`);
      } else {
        const { data: created, error: insertError } = await supabase
          .from("tenants")
          .insert({ ...payload, user_id: user.id })
          .select("id")
          .single();
        if (insertError) throw insertError;
        success("Tenant added");
        router.push(`/tenancy/tenants/${created.id}`);
      }
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to save tenant.";
      setError(message);
      toastError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8">
      <div>
        <label htmlFor="tenant-full-name" className={labelClassName}>
          Full Name
        </label>
        <input
          id="tenant-full-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={inputClassName}
          required
        />
      </div>

      <div>
        <label htmlFor="tenant-email" className={labelClassName}>
          Email Address
        </label>
        <input
          id="tenant-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="tenant-phone" className={labelClassName}>
          Phone Number
        </label>
        <input
          id="tenant-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="tenant-property" className={labelClassName}>
          Linked Property
        </label>
        <select
          id="tenant-property"
          value={propertyId}
          onChange={(event) => setPropertyId(event.target.value)}
          className={selectClassName}
        >
          <option value="">No property linked</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.address}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tenant-tenancy" className={labelClassName}>
          Linked Tenancy
        </label>
        <select
          id="tenant-tenancy"
          value={tenancyId}
          onChange={(event) => {
            const nextId = event.target.value;
            setTenancyId(nextId);
            const linked = tenancies.find((item) => item.id === nextId);
            if (linked?.property_id) setPropertyId(linked.property_id);
            if (linked && !moveInDate) setMoveInDate(linked.start_date);
          }}
          className={selectClassName}
        >
          <option value="">No tenancy linked</option>
          {linkedTenancies.map((item) => (
            <option key={item.id} value={item.id}>
              {item.tenant_names} — {item.property_address}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tenant-move-in" className={labelClassName}>
          Move In Date
        </label>
        <input
          id="tenant-move-in"
          type="date"
          value={moveInDate}
          onChange={(event) => setMoveInDate(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="tenant-notes" className={labelClassName}>
          Notes
        </label>
        <textarea
          id="tenant-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className={textareaClassName}
        />
      </div>

      {error ? (
        <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={btnNavyClassName}>
        {loading
          ? "Saving…"
          : isEditing
            ? "Save Changes"
            : "Add Tenant"}
      </button>
      <Link
        href={
          isEditing && tenant
            ? `/tenancy/tenants/${tenant.id}`
            : "/tenancy/tenants"
        }
        className={editorialFormCancelClassName}
      >
        Cancel
      </Link>
    </form>
  );
}
