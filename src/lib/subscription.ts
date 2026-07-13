export type SubscriptionModuleId = "compliance" | "tenancy" | "professional";

export interface SubscriptionModule {
  id: SubscriptionModuleId;
  name: string;
  price: number;
  features: string[];
  accentClass: string;
  borderClass: string;
}

export const SUBSCRIPTION_MODULES: SubscriptionModule[] = [
  {
    id: "compliance",
    name: "Compliance",
    price: 30,
    accentClass: "border-t-raspberry bg-white",
    borderClass: "border-raspberry/20",
    features: [
      "Certificate tracking across all property types",
      "Automated email alerts at 60, 30 and 7 days",
      "Contractor directory and email drafting",
      "Annual compliance report PDF",
      "Landlord portal sharing",
      "Bulk property import",
    ],
  },
  {
    id: "tenancy",
    name: "Tenancy",
    price: 35,
    accentClass: "border-t-navy bg-white",
    borderClass: "border-navy/20",
    features: [
      "Tenancy date tracking and renewal alerts",
      "Deposit protection monitoring",
      "Right to rent expiry tracking",
      "Professional tenancy notices",
      "Document storage",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 89,
    accentClass: "border-t-gold bg-white",
    borderClass: "border-gold/40",
    features: [
      "Everything in Compliance",
      "Everything in Tenancy",
      "AI Assistant — document drafting & portfolio Q&A",
      "Priority support",
      "Save £76/month vs buying separately",
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
