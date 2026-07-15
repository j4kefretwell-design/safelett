import Link from "next/link";
import OverviewHeroCarousel, {
  type OverviewCarouselPanel,
} from "@/components/dashboard/OverviewHeroCarousel";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import { MODE_HOME } from "@/lib/app-mode";
import { buildOverviewData, type OverviewActionItem } from "@/lib/overview";
import { CONTENT_IMAGE_QUALITY, IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import { editorialPagePaddingClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export const revalidate = 30;

const STARTER_PLAN_FEATURES = [
  "Compliance Certificate Tracking",
  "Automated Email Alerts",
  "Contractor Email Drafting",
  "Annual Compliance Reports",
] as const;

function buildModulePanel({
  id,
  href,
  label,
  clearText,
  actions,
  module,
}: {
  id: string;
  href: string;
  label: string;
  clearText: string;
  actions: OverviewActionItem[];
  module: "compliance" | "tenancy";
}): OverviewCarouselPanel {
  const moduleActions = actions.filter((item) => item.module === module);

  if (moduleActions.length === 0) {
    return { id, href, label, status: "clear", statusText: clearText };
  }

  const hasOverdue = moduleActions.some((item) => item.daysRemaining < 0);
  if (hasOverdue) {
    return {
      id,
      href,
      label,
      status: "overdue",
      statusText: "Overdue",
      count: moduleActions.length,
    };
  }

  return {
    id,
    href,
    label,
    status: "attention",
    statusText: "Action Needed",
    count: moduleActions.length,
  };
}

function buildActionsPanel(
  actions: OverviewActionItem[],
  urgentCount: number
): OverviewCarouselPanel {
  if (urgentCount === 0) {
    return {
      id: "actions",
      href: "#todays-actions",
      label: "Actions",
      status: "clear",
      statusText: "All Clear",
    };
  }

  const hasOverdue = actions.some((item) => item.daysRemaining < 0);
  if (hasOverdue) {
    return {
      id: "actions",
      href: "#todays-actions",
      label: "Actions",
      status: "overdue",
      statusText: "Overdue",
      count: urgentCount,
    };
  }

  return {
    id: "actions",
    href: "#todays-actions",
    label: "Actions",
    status: "attention",
    statusText: "Action Needed",
    count: urgentCount,
  };
}

export default async function OverviewDashboardPage() {
  const supabase = await createClient();

  const [{ data: properties }, { data: tenancies }] = await Promise.all([
    supabase.from("properties").select("*").order("created_at", { ascending: false }),
    supabase.from("tenancies").select("*").order("created_at", { ascending: false }),
  ]);

  const propertyList = (properties ?? []) as Property[];
  const tenancyList = (tenancies ?? []) as Tenancy[];
  const propertyIds = propertyList.map((property) => property.id);

  let certificates: Certificate[] = [];
  if (propertyIds.length > 0) {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .in("property_id", propertyIds);
    certificates = (data ?? []) as Certificate[];
  }

  const { stats, actions } = buildOverviewData({
    properties: propertyList,
    certificates,
    tenancies: tenancyList,
  });

  const carouselPanels: OverviewCarouselPanel[] = [
    buildModulePanel({
      id: "compliance",
      href: "/compliance",
      label: "Compliance",
      clearText: "Compliant",
      actions,
      module: "compliance",
    }),
    buildModulePanel({
      id: "tenancy",
      href: "/tenancy/dashboard",
      label: "Tenancy",
      clearText: "All Current",
      actions,
      module: "tenancy",
    }),
    buildActionsPanel(actions, stats.urgentCount),
    {
      id: "assistant",
      href: "/assistant",
      label: "Assistant",
      labelColor: "study",
      status: "promo",
      statusText: "Your Assistant",
      description: "Draft any email. Answer any question. Handle any admin.",
      footer: "Open →",
    },
  ];

  const currentPlan = "Starter Plan";
  const isHighestPlan = false;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-[#F2EDE8] text-umber">
      <RoutePrefetcher
        paths={[MODE_HOME.overview, MODE_HOME.tenancy, MODE_HOME.assistant]}
      />
      <section className="relative h-[calc((100vh-4rem)*0.85)] min-h-[440px] w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: siteImages.lukeGalloway.placeholderColor }}
          aria-hidden
        >
          <OptimizedFillImage
            image={siteImages.lukeGalloway}
            alt=""
            sizes="100vw"
            priority
            quality={IMAGE_QUALITY}
            className="object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(61, 43, 31, 0.45)" }}
            aria-hidden
          />
        </div>

        <OverviewHeroCarousel panels={carouselPanels} />
      </section>

      <section
        id="todays-actions"
        className={`scroll-mt-20 bg-[#F2EDE8] ${editorialPagePaddingClassName} py-14`}
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-[#6B503C]">
          Action Required
        </p>
        <div className="mt-3 h-px w-16 bg-[#C4A35A]/80" aria-hidden />

        {actions.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <span
              className="flex h-10 w-10 items-center justify-center text-2xl text-[#C4A35A]"
              aria-hidden
            >
              ✓
            </span>
            <p className="mt-5 font-serif text-xl italic tracking-wide text-[#3D2B1F]">
              Your portfolio is in order.
            </p>
          </div>
        ) : (
          <ul className="mt-10">
            {actions.map((item) => {
              const overdue = item.daysRemaining < 0;
              const soon = !overdue && item.daysRemaining <= 7;
              const daysColour = overdue
                ? "text-urgent"
                : soon
                  ? "text-attention"
                  : "text-[#6B503C]";
              const dotColour =
                item.module === "compliance" ? "bg-[#33181C]" : "bg-[#1B2A4A]";

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-[#C5AC91]/70 py-5 transition hover:bg-[#EDE6DF]/70 sm:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:gap-6"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 ${dotColour}`}
                      aria-hidden
                    />
                    <div className="min-w-0 sm:contents">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-[17px] tracking-wide text-[#3D2B1F]">
                          {item.address}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-[#6B503C]">
                          {item.typeLabel}
                        </p>
                      </div>
                      <p className="mt-1 min-w-0 truncate text-[13px] italic text-cocoa sm:mt-0">
                        {item.actionLabel}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-right text-lg font-semibold tabular-nums ${daysColour}`}
                    >
                      {overdue
                        ? Math.abs(item.daysRemaining)
                        : item.daysRemaining}
                      <span className="ml-0.5 text-[11px] font-normal uppercase tracking-wide">
                        d
                      </span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="w-full bg-[#1C2B23] px-6 py-12 text-center sm:py-14">
        <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-parchment-line/75">
          Fretwell &amp; Co Assistant
        </p>
        <p className="mx-auto mt-5 max-w-2xl font-serif text-xl leading-relaxed tracking-wide text-parchment-line sm:text-2xl">
          Your AI property management assistant. Draft letters, answer questions,
          prepare for meetings — anything a property manager needs.
        </p>
        <Link
          href="/assistant"
          className="mt-6 inline-block text-sm text-moss transition hover:text-gold"
        >
          Open Assistant →
        </Link>
      </section>

      <section className="w-full bg-greige-alt">
        <div className="h-px w-full bg-[#C4A35A]" aria-hidden />

        <div className="grid w-full grid-cols-1 md:grid-cols-[40%_60%] md:items-stretch">
          <div
            className="relative min-h-[320px] w-full md:min-h-0"
            style={{ backgroundColor: siteImages.sajeerMoCastle.placeholderColor }}
          >
            <OptimizedFillImage
              image={siteImages.sajeerMoCastle}
              alt=""
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={CONTENT_IMAGE_QUALITY}
              className="object-cover"
              style={{ objectPosition: "center 30%" }}
            />
          </div>

          <div className="flex w-full flex-col justify-center px-8 py-14 sm:px-12 lg:px-16 xl:px-20">
            <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-[#6B503C]">
              Your Plan
            </p>
            <div className="mt-3 h-px w-16 bg-[#C4A35A]/80" aria-hidden />

            <p className="mt-8 font-serif text-3xl tracking-wide text-[#3D2B1F] sm:text-4xl">
              {currentPlan}
            </p>

            <ul className="mt-8 space-y-3">
              {STARTER_PLAN_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[13px] leading-relaxed text-[#6B503C]"
                >
                  <span className="mt-0.5 shrink-0 text-[#C4A35A]" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-10 h-px w-16 bg-[#C4A35A]/80" aria-hidden />

            {isHighestPlan ? (
              <p className="mt-8 text-sm italic text-[#6B503C]">
                Your portfolio is fully supported.
              </p>
            ) : (
              <Link
                href="/subscription"
                className="mt-8 inline-block text-sm text-gold transition hover:opacity-80"
              >
                Upgrade to Professional →
              </Link>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-[#C4A35A]" aria-hidden />
      </section>
    </div>
  );
}
