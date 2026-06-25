import Link from "next/link";
import NavBar from "@/components/NavBar";
import StatusBanner from "@/components/StatusBanner";
import TrafficLight from "@/components/TrafficLight";
import { getPropertyStatus } from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import {
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  const propertyList = (properties ?? []) as Property[];

  const propertiesWithStatus = await Promise.all(
    propertyList.map(async (property) => {
      const { data: certificates } = await supabase
        .from("certificates")
        .select("expiry_date")
        .eq("property_id", property.id);

      const status = getPropertyStatus(
        (certificates ?? []) as Pick<Certificate, "expiry_date">[]
      );

      return { ...property, status };
    })
  );

  const attentionCount = propertiesWithStatus.filter(
    (p) => p.status !== "green"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <StatusBanner attentionCount={attentionCount} />

        {propertiesWithStatus.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-medium text-slate-900">
              No properties yet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Add your first property to start tracking compliance certificates.
            </p>
            <Link
              href="/properties/new"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Add Property
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {propertiesWithStatus.map((property) => (
              <li key={property.id}>
                <Link
                  href={`/properties/${property.id}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <TrafficLight status={property.status} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {property.address}
                    </p>
                    <p className="text-sm text-slate-500">
                      {PROPERTY_TYPE_LABELS[property.property_type]} ·{" "}
                      {property.bedrooms}{" "}
                      {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
