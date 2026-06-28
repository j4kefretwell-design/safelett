export type PropertyType = "standard_rental" | "hmo" | "student_let";

export type CertificateType =
  | "gas_safety"
  | "eicr"
  | "epc"
  | "fire_risk_assessment"
  | "fire_alarm_test"
  | "emergency_lighting_check"
  | "fire_extinguisher_service"
  | "deposit_protection"
  | "right_to_rent"
  | "hmo_licence"
  | "legionella_risk_assessment"
  | "pat"
  | "asbestos_survey";

export type ComplianceStatus = "green" | "amber" | "red";

export interface Property {
  id: string;
  user_id: string;
  address: string;
  property_type: PropertyType;
  bedrooms: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  property_id: string;
  certificate_type: CertificateType;
  issue_date: string;
  expiry_date: string;
  notes: string | null;
  document_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email_alerts_enabled: boolean;
  alert_at_60: boolean;
  alert_at_30: boolean;
  alert_at_7: boolean;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_USER_PROFILE: Omit<
  UserProfile,
  "id" | "created_at" | "updated_at"
> = {
  full_name: null,
  email_alerts_enabled: true,
  alert_at_60: true,
  alert_at_30: true,
  alert_at_7: true,
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  standard_rental: "Standard Rental",
  hmo: "HMO",
  student_let: "Student Let",
};

export const CERTIFICATE_LABELS: Record<CertificateType, string> = {
  gas_safety: "Gas Safety",
  eicr: "EICR",
  epc: "EPC",
  fire_risk_assessment: "Fire Risk Assessment",
  fire_alarm_test: "Fire Alarm Test",
  emergency_lighting_check: "Emergency Lighting Check",
  fire_extinguisher_service: "Fire Extinguisher Service",
  deposit_protection: "Deposit Protection",
  right_to_rent: "Right to Rent",
  hmo_licence: "HMO Licence",
  legionella_risk_assessment: "Legionella Risk Assessment",
  pat: "Portable Appliance Testing (PAT)",
  asbestos_survey: "Asbestos Survey",
};

export const CERTIFICATE_DATE_LABELS: Record<
  CertificateType,
  { issue: string; expiry: string }
> = {
  gas_safety: { issue: "Issue Date", expiry: "Expiry Date" },
  eicr: { issue: "Issue Date", expiry: "Expiry Date" },
  epc: { issue: "Issue Date", expiry: "Expiry Date" },
  fire_risk_assessment: { issue: "Issue Date", expiry: "Review Date" },
  fire_alarm_test: { issue: "Issue Date", expiry: "Expiry Date" },
  emergency_lighting_check: { issue: "Issue Date", expiry: "Expiry Date" },
  fire_extinguisher_service: { issue: "Issue Date", expiry: "Expiry Date" },
  deposit_protection: { issue: "Issue Date", expiry: "Expiry Date" },
  right_to_rent: { issue: "Issue Date", expiry: "Expiry Date" },
  hmo_licence: { issue: "Issue Date", expiry: "Expiry Date" },
  legionella_risk_assessment: {
    issue: "Date Completed",
    expiry: "Next Review",
  },
  pat: { issue: "Issue Date", expiry: "Expiry Date" },
  asbestos_survey: { issue: "Date Completed", expiry: "Next Review" },
};

export const CERTIFICATE_TYPE_HINTS: Partial<Record<CertificateType, string>> =
  {
    fire_risk_assessment: "Required annually for HMOs. Set the review date.",
    hmo_licence:
      "Required for properties with 5+ people. Typically renewed every 5 years.",
    legionella_risk_assessment:
      "No fixed expiry — enter when completed and your planned next review date.",
    pat: "Annual requirement for HMOs and student lets.",
    asbestos_survey:
      "No fixed expiry — enter when completed and your planned next review date.",
  };

export const PROPERTY_TYPES: PropertyType[] = [
  "standard_rental",
  "hmo",
  "student_let",
];

export const CERTIFICATE_TYPES: CertificateType[] = [
  "gas_safety",
  "eicr",
  "epc",
  "fire_risk_assessment",
  "hmo_licence",
  "legionella_risk_assessment",
  "pat",
  "asbestos_survey",
  "fire_alarm_test",
  "emergency_lighting_check",
  "fire_extinguisher_service",
  "deposit_protection",
  "right_to_rent",
];

export function getCertificateDateLabels(certificateType: CertificateType) {
  return CERTIFICATE_DATE_LABELS[certificateType];
}
