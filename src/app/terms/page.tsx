import type { Metadata } from "next";
import LegalPageShell from "@/components/layout/LegalPageShell";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Terms of Service — ${BRAND_NAME}`,
  description: "Terms and conditions for using Fretwell & Co.",
};

const LAST_UPDATED = "July 06, 2026";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <h2>Acceptance of Terms</h2>
      <p>
        By accessing and using Fretwell &amp; Co (&quot;the Service&quot;), you
        agree to be bound by these Terms of Service.
      </p>

      <h2>Description of Service</h2>
      <p>
        Fretwell &amp; Co is a property compliance tracking tool for UK property
        managers and letting agents. The Service provides certificate tracking,
        automated alerts, contractor management, and compliance reporting tools.
      </p>

      <h2>Important Disclaimer</h2>
      <p>
        Fretwell &amp; Co is a reminder and tracking tool only. It does not
        constitute legal advice. Users remain solely responsible for ensuring
        their properties comply with all applicable laws and regulations.
        Fretwell &amp; Co accepts no liability for fines, penalties, or legal
        consequences arising from missed compliance deadlines or regulatory
        changes.
      </p>

      <h2>User Responsibilities</h2>
      <ul>
        <li>
          You are responsible for the accuracy of data entered into the Service.
        </li>
        <li>
          You are responsible for acting upon alerts and reminders provided by
          the Service.
        </li>
        <li>
          You must ensure you have appropriate authorisation to manage the
          properties entered into the Service.
        </li>
      </ul>

      <h2>Payment and Subscriptions</h2>
      <p>
        Subscription fees are charged monthly. You may cancel at any time. No
        refunds are provided for partial months.
      </p>

      <h2>Data and Privacy</h2>
      <p>
        Your use of the Service is also governed by our{" "}
        <a href="https://fretwellcompliance.uk/privacy-policy">Privacy Policy</a>
        .
      </p>

      <h2>Modifications</h2>
      <p>
        We reserve the right to modify these terms at any time. Continued use of
        the Service constitutes acceptance of modified terms.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these terms contact{" "}
        <a href="mailto:support@fretwellcompliance.uk">
          support@fretwellcompliance.uk
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
