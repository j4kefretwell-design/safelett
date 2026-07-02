interface ComplianceBannerProps {
  stats: {
    total: number;
    compliant: number;
    attention: number;
    overdue: number;
  };
}

export default function ComplianceBanner({ stats }: ComplianceBannerProps) {
  if (stats.total === 0) {
    return null;
  }

  const needsAttention = stats.attention + stats.overdue;

  if (needsAttention === 0) {
    return (
      <div className="-mx-6 mb-12 bg-[#2d4a38] px-8 py-7 sm:-mx-10 sm:px-10 lg:-mx-14 lg:px-14">
        <p className="font-serif text-xl tracking-wide text-dusty-cream sm:text-2xl">
          All Properties Compliant
        </p>
        <p className="mt-2 text-sm font-light text-dusty-cream/65">
          Every certificate across your portfolio is current.
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-6 mb-12 bg-raspberry px-8 py-7 sm:-mx-10 sm:px-10 lg:-mx-14 lg:px-14">
      <p className="font-serif text-xl tracking-wide text-dusty-cream sm:text-2xl">
        {needsAttention} {needsAttention === 1 ? "Property" : "Properties"} Need
        Attention
      </p>
      <p className="mt-2 text-sm font-light text-dusty-cream/65">
        {stats.overdue > 0 && (
          <span>
            {stats.overdue} overdue
            {stats.attention > 0 ? " · " : ""}
          </span>
        )}
        {stats.attention > 0 && (
          <span>{stats.attention} approaching expiry</span>
        )}
      </p>
    </div>
  );
}
