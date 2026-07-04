import Link from "next/link";
import { getDaysUntilExpiry } from "@/lib/compliance";
import type { CertificateType, PropertyContractor } from "@/lib/types";

interface CertificateContractorEmailLinkProps {
  propertyId: string;
  certificateId: string;
  certificateType: CertificateType;
  expiryDate: string;
  contractorsByType: Map<CertificateType, PropertyContractor>;
}

export default function CertificateContractorEmailLink({
  propertyId,
  certificateId,
  certificateType,
  expiryDate,
  contractorsByType,
}: CertificateContractorEmailLinkProps) {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

  if (daysUntilExpiry > 60) {
    return null;
  }

  const contractor = contractorsByType.get(certificateType);

  if (contractor) {
    return (
      <Link
        href={`/properties/${propertyId}/certificates/${certificateId}/draft-email`}
        className="text-sm font-light text-gold-readable transition hover:text-gold"
      >
        Draft Contractor Email →
      </Link>
    );
  }

  return (
    <Link
      href="#contractors"
      className="text-sm font-light text-leather/50 transition hover:text-leather"
    >
      Add Contractor to Enable
    </Link>
  );
}
