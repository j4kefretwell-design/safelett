import Link from "next/link";
import OverviewHeroCarousel, {
  type OverviewCarouselPanel,
} from "@/components/dashboard/OverviewHeroCarousel";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import { MODE_HOME } from "@/lib/app-mode-routes";
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
  module,
  clearText,
  attentionText,
  actions,
  portfolioEmpty,
  emptyCtaHref,
  emptyCtaText,
  metaText,
}: {
  id: string;
  href: string;
  label: string;
  module: "compliance" | "tenancy";
  clearText: string;
  attentionText: string;
  actions: OverviewActionItem[];
  portfolioEmpty: boolean;
  emptyCtaHref: string;
  emptyCtaText: string;
  metaText?: string;
}): OverviewCarouselPanel {
  if (portfolioEmpty) {
    return {
      id,
      href: emptyCtaHref,
      label,
      module,
      status: "empty",
      statusText: emptyCtaText,
      ctaHref: emptyCtaHref,
    };
  }

  const moduleActions = actions.filter((item) => item.module === module);

  if (moduleActions.length === 0) {
    return {
      id,
      href,
      label,
      module,
      status: "clear",
      statusText: clearText,
      metaText,
    };
  }

  const hasOverdue = moduleActions.some((item) => item.daysRemaining < 0);
  const filterHref =
    module === "compliance"
      ? hasOverdue
        ? `${href}?filter=overdue`
        : `${href}?filter=attention`
      : `${href}?filter=urgent`;

  return {
    id,
    href: filterHref,
    label,
    module,
    status: hasOverdue ? "overdue" : "attention",
    statusText: attentionText,
    count: moduleActions.length,
    metaText,
  };
}

function buildActionsPanel(
  actions: OverviewActionItem[],
  urgentCount: number,
  hasProperties: boolean
): OverviewCarouselPanel {
  if (urgentCount === 0 && !hasProperties) {
    return {
      id: "actions",
      href: "#todays-actions",
      label: "Actions",
      module: "actions",
      status: "empty",
      statusText: "Nothing yet",
      description: "Add properties to track actions",
    };
  }

  if (urgentCount === 0) {
    return {
      id: "actions",
      href: "#todays-actions",
      label: "Actions",
      module: "actions",
      status: "clear",
      statusText: "Nothing Urgent",
    };
  }

  const complianceActions = actions.filter((item) => item.module === "compliance");
  const tenancyActions = actions.filter((item) => item.module === "tenancy");
  const hasOverdue = actions.some((item) => item.daysRemaining < 0);

  const complianceHref = complianceActions.some((item) => item.daysRemaining < 0)
    ? "/compliance?filter=overdue"
    : "/compliance?filter=attention";
  const tenancyHref = "/tenancy/dashboard?filter=urgent";

  if (complianceActions.length > 0 && tenancyActions.length > 0) {
    return {
      id: "actions",
      href: "#todays-actions",
      label: "Actions",
      module: "actions",
      status: hasOverdue ? "overdue" : "attention",
      statusText: "Items Need Attention",
      count: urgentCount,
      actionChoices: [
        {
          label: `Compliance (${complianceActions.length}) →`,
          href: complianceHref,
        },
        {
          label: `Tenancy (${tenancyActions.length}) →`,
          href: tenancyHref,
        },
      ],
    };
  }

  return {
    id: "actions",
    href:
      complianceActions.length > 0
        ? complianceHref
        : tenancyActions.length > 0
          ? tenancyHref
          : "#todays-actions",
    label: "Actions",
    module: "actions",
    status: hasOverdue ? "overdue" : "attention",
    statusText: "Items Need Attention",
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

  const propertyCountLabel =
    propertyList.length === 1
      ? "1 property"
      : `${propertyList.length} properties`;
  const tenancyCountLabel =
    tenancyList.length === 1
      ? "1 tenancy"
      : `${tenancyList.length} tenancies`;

  const carouselPanels: OverviewCarouselPanel[] = [
    buildModulePanel({
      id: "compliance",
      href: "/compliance",
      label: "Compliance",
      module: "compliance",
      clearText: "All Clear",
      attentionText: "Needs Attention",
      actions,
      portfolioEmpty: propertyList.length === 0,
      emptyCtaHref: "/properties/new",
      emptyCtaText: "Add Property +",
      metaText: propertyList.length > 0 ? propertyCountLabel : undefined,
    }),
    buildModulePanel({
      id: "tenancy",
      href: "/tenancy/dashboard",
      label: "Tenancy",
      module: "tenancy",
      clearText: "All Current",
      attentionText: "Renewals Due",
      actions,
      portfolioEmpty: tenancyList.length === 0,
      emptyCtaHref: "/tenancy/new",
      emptyCtaText: "Add Tenancy +",
      metaText: tenancyList.length > 0 ? tenancyCountLabel : undefined,
    }),
    buildActionsPanel(actions, stats.urgentCount, propertyList.length > 0),
    {
      id: "assistant",
      href: "/assistant",
      label: "Assistant",
      module: "assistant",
      status: "promo",
      statusText: "Your Personal Assistant",
      description: "Draft · Ask · Report",
    },
  ];

  const currentPlan = "Starter Plan";
  const isHighestPlan = false;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-vanilla text-text">
      <RoutePrefetcher
        paths={[MODE_HOME.overview, MODE_HOME.tenancy, MODE_HOME.assistant]}
      />
      <section className="relative h-[60vh] min-h-[360px] w-full overflow-hidden md:h-[calc((100vh-4rem)*0.85)] md:min-h-[440px]">
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
            style={{ objectPosition: "center 45%" }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(68, 58, 53, 0.45)" }}
            aria-hidden
          />
        </div>

        <OverviewHeroCarousel panels={carouselPanels} />
      </section>

      <section
        id="todays-actions"
        className={`scroll-mt-20 bg-vanilla ${editorialPagePaddingClassName} py-14`}
      >
        <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-leather">
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
            <p className="mt-5 font-serif text-xl italic tracking-wide text-umber">
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
                  : "text-leather";
              const dotColour =
                item.module === "compliance" ? "bg-[#33181C]" : "bg-[#1B2339]";

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-taupe py-5 transition hover:bg-dune sm:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:gap-6"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 ${dotColour}`}
                      aria-hidden
                    />
                    <div className="min-w-0 sm:contents">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-[17px] tracking-wide text-umber">
                          {item.address}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-leather">
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

      <section className="w-full bg-forest px-6 py-12 text-center sm:py-14">
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

      <section className="w-full bg-dune">
        <div className="h-px w-full bg-[#C4A35A]" aria-hidden />

        <div className="grid w-full grid-cols-1 md:grid-cols-[40%_60%] md:items-stretch">
          <div
            className="relative h-[200px] w-full md:h-auto md:min-h-0"
            style={{ backgroundColor: siteImages.overviewPlanManor.placeholderColor }}
          >
            <OptimizedFillImage
              image={siteImages.overviewPlanManor}
              alt=""
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={CONTENT_IMAGE_QUALITY}
              className="object-cover"
              style={{ objectPosition: "center 50%" }}
            />
          </div>

          <div className="flex w-full flex-col justify-center px-8 py-14 sm:px-12 lg:px-16 xl:px-20">
            <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-leather">
              Your Plan
            </p>
            <div className="mt-3 h-px w-16 bg-[#C4A35A]/80" aria-hidden />

            <p className="mt-8 font-serif text-3xl tracking-wide text-umber sm:text-4xl">
              {currentPlan}
            </p>

            <ul className="mt-8 space-y-3">
              {STARTER_PLAN_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[13px] leading-relaxed text-taupe"
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
              <p className="mt-8 text-sm italic text-taupe">
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
