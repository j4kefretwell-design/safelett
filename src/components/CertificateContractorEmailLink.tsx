import Link from "next/link";
import { Mail } from "lucide-react";
import { getDaysUntilExpiry } from "@/lib/compliance";
import {
  addContractorBtnClassName,
  draftContractorEmailBtnClassName,
} from "@/lib/ui";
import type { CertificateType, Contractor } from "@/lib/types";

interface CertificateContractorEmailLinkProps {
  propertyId: string;
  certificateId: string;
  certificateType: CertificateType;
  expiryDate: string;
  contractorsByType: Map<CertificateType, Contractor>;
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
        className={draftContractorEmailBtnClassName}
      >
        <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.25} aria-hidden="true" />
        Draft Contractor Email
      </Link>
    );
  }

  return (
    <Link href="#contractors" className={addContractorBtnClassName}>
      Add Contractor
    </Link>
  );
}
