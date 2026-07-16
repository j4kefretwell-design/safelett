import type { Metadata } from "next";
import LegalPageShell from "@/components/layout/LegalPageShell";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRAND_NAME}`,
  description: "How Fretwell & Co collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "July 06, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      registrationLine="Data Controller Registration: ICO Registration No. ZC199325"
    >
      <h2>1. Introduction</h2>
      <p>
        Fretwell &amp; Co (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the
        Fretwell &amp; Co property compliance platform at{" "}
        <a href="https://fretwellcompliance.uk">fretwellcompliance.uk</a> (the
        &quot;Service&quot;). This Privacy Policy explains how we collect, use,
        store, and protect your personal information when you use our Service.
      </p>
      <p>
        We are committed to protecting your privacy and handling your data in
        accordance with the UK General Data Protection Regulation (UK GDPR) and
        the Data Protection Act 2018.
      </p>

      <h2>2. Who We Are</h2>
      <p>
        Fretwell &amp; Co is a property compliance tracking service for UK
        property managers and letting agents. For data protection enquiries,
        contact us at{" "}
        <a href="mailto:support@fretwellcompliance.uk">
          support@fretwellcompliance.uk
        </a>
        .
      </p>

      <h2>3. Information We Collect</h2>
      <p>We collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Account information:</strong> email address, password (stored
          securely hashed), and name if you provide it in your profile settings.
        </li>
        <li>
          <strong>Property and compliance data:</strong> property addresses,
          property types, bedroom counts, certificate details (types, issue and
          expiry dates, notes), and uploaded certificate documents (PDF or JPEG).
        </li>
        <li>
          <strong>Contractor information:</strong> names, company names, phone
          numbers, email addresses, and certificate types handled, as entered by
          you.
        </li>
        <li>
          <strong>Usage data:</strong> information about how you interact with the
          Service, including pages visited and features used, collected through
          standard server logs.
        </li>
        <li>
          <strong>Communications:</strong> emails we send to you (such as expiry
          alerts and welcome messages) and any correspondence you send to our
          support team.
        </li>
      </ul>

      <h2>4. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide, operate, and maintain the Service</li>
        <li>Track compliance certificates and calculate expiry statuses</li>
        <li>Send automated expiry alerts at 60, 30, and 7 days before deadlines</li>
        <li>Generate compliance reports and landlord sharing links at your request</li>
        <li>Respond to your support enquiries</li>
        <li>Improve and develop the Service</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>5. Legal Basis for Processing</h2>
      <p>Under UK GDPR, we process your data on the following bases:</p>
      <ul>
        <li>
          <strong>Contract:</strong> processing necessary to provide the Service
          you have subscribed to.
        </li>
        <li>
          <strong>Legitimate interests:</strong> improving the Service, ensuring
          security, and sending service-related communications.
        </li>
        <li>
          <strong>Consent:</strong> where you have opted in to specific
          notification preferences.
        </li>
        <li>
          <strong>Legal obligation:</strong> where we are required to retain or
          disclose data by law.
        </li>
      </ul>

      <h2>6. Data Sharing and Third Parties</h2>
      <p>
        We do not sell your personal data. We share data only with trusted
        service providers who help us operate the Service:
      </p>
      <ul>
        <li>
          <strong>Supabase:</strong> database hosting, authentication, and
          secure file storage for certificate documents.
        </li>
        <li>
          <strong>Resend:</strong> transactional email delivery for alerts and
          account communications.
        </li>
        <li>
          <strong>Vercel:</strong> application hosting and content delivery.
        </li>
        <li>
          <strong>Anthropic:</strong> powering the Compliance News feature when
          you request regulatory updates (no personal property data is sent).
        </li>
      </ul>
      <p>
        All third-party providers are bound by data processing agreements and
        process data only on our instructions.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain your account and property data for as long as your account is
        active. If you delete your account, we will delete or anonymise your
        personal data within 30 days, except where we are required to retain it
        for legal or regulatory purposes.
      </p>
      <p>
        Certificate documents stored in our secure storage are deleted when you
        remove the associated certificate or property, or when your account is
        closed.
      </p>

      <h2>8. Data Security</h2>
      <p>
        We implement appropriate technical and organisational measures to
        protect your data, including encryption in transit (HTTPS), secure
        authentication, row-level security on database records so each user can
        only access their own data, and private storage buckets for uploaded
        documents.
      </p>
      <p>
        No method of transmission over the internet is completely secure. While
        we strive to protect your data, we cannot guarantee absolute security.
      </p>

      <h2>9. Your Rights</h2>
      <p>Under UK GDPR, you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Object to or restrict certain processing</li>
        <li>Request data portability</li>
        <li>Withdraw consent where processing is based on consent</li>
        <li>Lodge a complaint with the Information Commissioner&apos;s Office (ICO)</li>
      </ul>
      <p>
        To exercise any of these rights, contact{" "}
        <a href="mailto:support@fretwellcompliance.uk">
          support@fretwellcompliance.uk
        </a>
        . We will respond within one month.
      </p>

      <h2>10. Landlord Sharing Links</h2>
      <p>
        When you generate a landlord sharing link for a property, a read-only
        view of that property&apos;s compliance information becomes accessible to
        anyone with the link. You are responsible for sharing links only with
        authorised recipients.
      </p>

      <h2>11. Cookies</h2>
      <p>
        We use essential cookies required for authentication and session
        management. We do not use advertising or third-party tracking cookies.
      </p>

      <h2>12. International Transfers</h2>
      <p>
        Some of our service providers may process data outside the UK. Where this
        occurs, we ensure appropriate safeguards are in place, such as Standard
        Contractual Clauses or adequacy decisions.
      </p>

      <h2>13. Children</h2>
      <p>
        The Service is intended for business use by property professionals and
        is not directed at individuals under 18. We do not knowingly collect
        data from children.
      </p>

      <h2>14. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the
        revised policy on this page with an updated &quot;Last updated&quot; date.
        Continued use of the Service after changes constitutes acceptance of the
        updated policy.
      </p>

      <h2>15. Contact Us</h2>
      <p>
        For questions about this Privacy Policy or your personal data, contact:
      </p>
      <p>
        Email:{" "}
        <a href="mailto:support@fretwellcompliance.uk">
          support@fretwellcompliance.uk
        </a>
      </p>
    </LegalPageShell>
  );
}
