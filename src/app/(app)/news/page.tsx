import ComplianceNewsClient from "@/components/news/ComplianceNewsClient";

export default function NewsPage() {
  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden">
      <section className="dashboard-portfolio-divider flex flex-col items-center justify-center px-5 py-10 text-center">
        <p className="caps-label text-dusty-cream">Compliance News</p>
        <p className="mt-3 text-base italic leading-relaxed text-dusty-cream/90">
          Latest UK landlord legislation and regulatory updates
        </p>
      </section>

      <ComplianceNewsClient />
    </div>
  );
}
