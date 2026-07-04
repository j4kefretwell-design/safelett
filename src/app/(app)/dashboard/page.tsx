import Image from "next/image";
import Link from "next/link";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { getPropertyStatus } from "@/lib/compliance";
import { btnGoldClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, ComplianceStatus, Property } from "@/lib/types";
import DashboardPortfolio from "./DashboardPortfolio";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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
    {
      label: "Total Properties",
      value: stats.total,
      description: "Across your portfolio",
    },
    {
      label: "Compliant",
      value: stats.compliant,
      description: "Certificates up to date",
    },
    {
      label: "Needs Attention",
      value: stats.attention,
      description: "Approaching expiry",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      description: "Past due date",
    },
  ];

  return (
    <div className="dashboard-parchment-bg w-full">
      <section className="dashboard-status-band px-8 py-14 text-center sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        <p className="font-serif text-sm italic tracking-wide text-gold">
          {getGreeting()}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-tight tracking-wide text-raspberry sm:mx-auto sm:text-4xl lg:text-5xl">
          {isCompliant
            ? "All Properties Compliant"
            : `${needsAttention} ${needsAttention === 1 ? "Property" : "Properties"} Need Attention`}
        </h1>
      </section>

      <section className="relative h-[320px] w-full overflow-hidden">
        <Image
          src="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-raspberry/55" aria-hidden="true" />
      </section>

      <section className="dashboard-parchment-bg px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {statItems.map((item) => (
            <div key={item.label} className="dashboard-warm-card px-5 py-10 text-center">
              <div className="dashboard-warm-card-content">
                <p className="font-serif text-4xl tracking-wide text-text sm:text-5xl lg:text-6xl">
                  {item.value}
                </p>
                <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.22em] text-leather">
                  {item.label}
                </p>
                <p className="mt-2 text-[11px] italic text-tan">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid overflow-hidden sm:mt-14 lg:grid-cols-[45%_55%]">
          <div className="relative h-[280px] overflow-hidden">
            <Image
              src="/ben-elliott-8WJtlR3nlQY-unsplash.jpg"
              alt=""
              fill
              className="object-cover object-[38%_center]"
              sizes="45vw"
            />
          </div>

          <div className="dashboard-cottage-panel flex flex-col justify-center border-t border-gold px-8 py-12 sm:px-10 lg:border-t-0 lg:border-l lg:px-14 lg:py-10">
            <p className="max-w-md font-serif text-2xl leading-snug tracking-wide text-raspberry sm:text-[1.65rem]">
              A compliant portfolio is a protected portfolio.
            </p>
            <p className="mt-4 max-w-sm text-sm text-leather">
              Every certificate tracked. Every deadline met.
            </p>
            <Link href="/reminders" className={`${btnGoldClassName} mt-8 w-fit text-[11px]`}>
              View Reminders →
            </Link>
          </div>
        </div>

        <div className="mt-16 lg:mt-20">
          <DashboardPortfolio
            properties={
              propertiesWithStatus as (Property & { status: ComplianceStatus })[]
            }
          />
        </div>
      </section>
    </div>
  );
}
