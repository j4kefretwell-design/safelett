import Image from "next/image";
import Link from "next/link";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { getPropertyStatus } from "@/lib/compliance";
import { btnGoldClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, ComplianceStatus, Property } from "@/lib/types";
import DashboardPortfolio from "./DashboardPortfolio";

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

  const stats = {
    total: propertiesWithStatus.length,
    compliant: propertiesWithStatus.filter((p) => p.status === "green").length,
    attention: propertiesWithStatus.filter((p) => p.status === "amber").length,
    overdue: propertiesWithStatus.filter((p) => p.status === "red").length,
  };

  if (propertiesWithStatus.length === 0) {
    return <DashboardEmptyState />;
  }

  const needsAttention = stats.attention + stats.overdue;
  const isCompliant = needsAttention === 0;

  const statItems = [
    { label: "Total Properties", value: stats.total },
    { label: "Compliant", value: stats.compliant },
    { label: "Needs Attention", value: stats.attention },
    { label: "Overdue", value: stats.overdue },
  ];

  return (
    <div className="w-full bg-dusty-cream pt-2">
      <section className="relative h-[200px] max-h-[200px] w-full overflow-hidden bg-raspberry">
        <div className="absolute inset-0">
          <Image
            src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-raspberry/70" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
          <p className="font-serif text-sm italic tracking-wide text-gold">
            Portfolio Status —
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-2xl leading-tight tracking-wide text-dusty-cream sm:text-3xl lg:text-4xl">
            {isCompliant
              ? "All Properties Compliant"
              : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
          </h1>
        </div>
      </section>

      <section className="bg-dusty-cream px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="border border-leather/30 bg-white px-5 py-10 text-center"
            >
              <p className="font-serif text-4xl tracking-wide text-text sm:text-5xl lg:text-6xl">
                {item.value}
              </p>
              <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.22em] text-leather">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[280px] lg:min-h-[320px]">
          <Image
            src="/vojtech-bartonicek-wgG7jLQ7M0U-unsplash.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-[#1A0A0C]/45" />
        </div>

        <div className="flex flex-col justify-center bg-dusty-cream px-8 py-14 sm:px-12 lg:px-16 lg:py-20">
          <p className="max-w-md font-serif text-2xl leading-snug tracking-wide text-text sm:text-3xl">
            Every property in your portfolio, protected and accounted for.
          </p>
          <Link href="/reminders" className={`${btnGoldClassName} mt-8 w-fit`}>
            View Reminders →
          </Link>
        </div>
      </section>

      <section className="bg-dusty-cream px-8 pb-20 pt-4 sm:px-12 sm:pb-24 lg:px-16 lg:pb-28">
        <DashboardPortfolio
          properties={
            propertiesWithStatus as (Property & { status: ComplianceStatus })[]
          }
        />
      </section>
    </div>
  );
}
