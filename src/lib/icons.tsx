import {
  AlertTriangle,
  AlarmSmoke,
  Bell,
  Building2,
  CheckCircle,
  Clock,
  Droplets,
  FileCheck,
  Flame,
  HardHat,
  Home,
  LayoutDashboard,
  Leaf,
  Lightbulb,
  Plug,
  Settings,
  Shield,
  Upload,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CertificateType } from "@/lib/types";

export const CERTIFICATE_ICONS: Record<CertificateType, LucideIcon> = {
  gas_safety: Flame,
  eicr: Zap,
  epc: Leaf,
  fire_risk_assessment: AlarmSmoke,
  fire_alarm_test: Bell,
  emergency_lighting_check: Lightbulb,
  fire_extinguisher_service: Flame,
  deposit_protection: Shield,
  right_to_rent: FileCheck,
  hmo_licence: Building2,
  legionella_risk_assessment: Droplets,
  pat: Plug,
  asbestos_survey: HardHat,
};

export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  reminders: Bell,
  addProperty: Home,
  bulkImport: Upload,
  settings: Settings,
} as const;

export const STAT_ICONS = {
  total: Building2,
  compliant: CheckCircle,
  attention: AlertTriangle,
  overdue: Clock,
} as const;

interface CertificateTypeIconProps {
  type: CertificateType;
  className?: string;
  strokeWidth?: number;
}

export function CertificateTypeIcon({
  type,
  className = "h-4 w-4",
  strokeWidth = 1.75,
}: CertificateTypeIconProps) {
  const Icon = CERTIFICATE_ICONS[type];
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
