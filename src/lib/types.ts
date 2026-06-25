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
  | "right_to_rent";

export type ComplianceStatus = "green" | "amber" | "red";

export interface Property {
  id: string;
  user_id: string;
  address: string;
  property_type: PropertyType;
  bedrooms: number;
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
  created_at: string;
  updated_at: string;
}

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
  "fire_alarm_test",
  "emergency_lighting_check",
  "fire_extinguisher_service",
  "deposit_protection",
  "right_to_rent",
];
