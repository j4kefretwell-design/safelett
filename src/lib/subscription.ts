export type SubscriptionModuleId = "compliance" | "tenancy" | "professional";

export interface SubscriptionModule {
  id: SubscriptionModuleId;
  name: string;
  price: number;
  priceNote: string;
  features: string[];
  accentClass: string;
  borderClass: string;
  buttonClass: string;
  checkClass: string;
  badge?: string;
}

export const SUBSCRIPTION_MODULES: SubscriptionModule[] = [
  {
    id: "compliance",
    name: "Compliance",
    price: 30,
    priceNote: "/month",
    accentClass: "border-t-raspberry bg-white",
    borderClass: "border-raspberry/25",
    buttonClass: "bg-raspberry text-dusty-cream hover:bg-raspberry-dark",
    checkClass: "text-raspberry",
    features: [
      "Certificate tracking across all property types",
      "Gas Safety, EICR, EPC, Fire Risk Assessment and all certificate types",
      "Automated email alerts at 60, 30 and 7 days before expiry",
      "Contractor directory and email drafting",
      "Annual compliance report PDF",
      "Landlord portal sharing link",
      "Bulk property import",
      "Compliance news feed",
    ],
  },
  {
    id: "tenancy",
    name: "Tenancy",
    price: 35,
    priceNote: "/month",
    accentClass: "border-t-navy bg-white",
    borderClass: "border-navy/25",
    buttonClass: "bg-navy text-dusty-cream hover:bg-navy-dark",
    checkClass: "text-navy",
    features: [
      "Full tenancy lifecycle tracking",
      "Deposit protection monitoring with 30-day deadline alerts",
      "Tenancy renewal and rent review alerts",
      "Right to rent expiry tracking",
      "Professional notice drafting (Section 13, Section 21, renewal offers)",
      "Tenant directory and contact management",
      "Tenancy document storage",
      "Bulk tenancy import",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 89,
    priceNote: "/month — includes everything",
    accentClass: "border-t-study bg-[#FAFAF7]",
    borderClass: "border-study/30",
    buttonClass: "bg-study text-dusty-cream hover:bg-olive",
    checkClass: "text-study",
    badge: "Best Value",
    features: [
      "Everything in Compliance",
      "Everything in Tenancy",
      "AI Property Management Assistant — draft any letter, answer any question, handle any admin",
      "Portfolio Q&A — ask questions about your live data",
      "Document drafting — professional letters, notices and correspondence",
      "Save £76/month vs buying separately",
      "Priority support",
    ],
  },
];

export interface SubscriptionSelection {
  compliance: boolean;
  tenancy: boolean;
  professional: boolean;
}

export interface SubscriptionSummary {
  total: number;
  retail: number;
  savings: number;
  modules: string[];
}

const AI_MODULE_RETAIL = 100;

export function calculateSubscriptionSummary(
  selection: SubscriptionSelection
): SubscriptionSummary | null {
  if (selection.professional) {
    return {
      total: 89,
      retail: 30 + 35 + AI_MODULE_RETAIL,
      savings: 76,
      modules: ["Compliance", "Tenancy", "AI Assistant", "Priority support"],
    };
  }

  const { compliance, tenancy } = selection;

  if (!compliance && !tenancy) {
    return null;
  }

  if (compliance && tenancy) {
    return {
      total: 55,
      retail: 65,
      savings: 10,
      modules: ["Compliance", "Tenancy"],
    };
  }

  if (compliance) {
    return {
      total: 30,
      retail: 30,
      savings: 0,
      modules: ["Compliance"],
    };
  }

  return {
    total: 35,
    retail: 35,
    savings: 0,
    modules: ["Tenancy"],
  };
}
