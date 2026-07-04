import HelpFaqAccordion from "@/components/help/HelpFaqAccordion";
import { editorialFormSectionRuleClassName } from "@/lib/ui";

const GETTING_STARTED_STEPS = [
  {
    number: "01",
    title: "Add Your Properties",
    body: "Begin by adding each property you manage. Include the address, property type and number of bedrooms.",
  },
  {
    number: "02",
    title: "Upload Certificates",
    body: "For each property, add your compliance certificates with their expiry dates. Upload a copy of the document for your records.",
  },
  {
    number: "03",
    title: "Stay Compliant",
    body: "Fretwell & Co will automatically alert you when certificates are approaching expiry. Add your contractors to enable email drafting.",
  },
] as const;

export default function HelpPage() {
  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden">
      <section className="dashboard-portfolio-divider flex flex-col items-center justify-center px-5 py-10 text-center">
        <p className="caps-label text-dusty-cream">Help &amp; Support</p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div>
          <h2 className="caps-label text-leather">Getting Started</h2>
          <div className="mt-8 space-y-0">
            {GETTING_STARTED_STEPS.map((step, index) => (
              <div key={step.number}>
                {index > 0 && (
                  <div
                    className={editorialFormSectionRuleClassName}
                    aria-hidden="true"
                  />
                )}
                <div className={index > 0 ? "pt-8" : ""}>
                  <p className="text-sm font-normal tracking-[0.2em] text-gold-readable">
                    {step.number}
                  </p>
                  <h3 className="mt-3 font-serif text-xl tracking-wide text-raspberry">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-leather">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={editorialFormSectionRuleClassName} aria-hidden="true" />

        <div>
          <h2 className="caps-label text-leather">Frequently Asked Questions</h2>
          <div className="mt-8">
            <HelpFaqAccordion />
          </div>
        </div>

        <div className={editorialFormSectionRuleClassName} aria-hidden="true" />

        <div>
          <h2 className="caps-label text-leather">Contact Support</h2>
          <p className="mt-6 text-base leading-relaxed text-leather">
            Need further assistance? We&apos;re here to help.
          </p>
          <p className="mt-4 text-base leading-relaxed text-text">
            Email:{" "}
            <a
              href="mailto:support@fretwellcompliance.uk"
              className="text-raspberry underline-offset-4 transition hover:underline"
            >
              support@fretwellcompliance.uk
            </a>
          </p>
          <p className="mt-4 text-sm font-light italic text-leather/80">
            We aim to respond within 24 hours on business days.
          </p>
        </div>
      </section>
    </div>
  );
}
