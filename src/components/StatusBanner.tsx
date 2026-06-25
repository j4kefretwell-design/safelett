interface StatusBannerProps {
  attentionCount: number;
}

export default function StatusBanner({ attentionCount }: StatusBannerProps) {
  if (attentionCount === 0) {
    return (
      <h1 className="text-4xl font-bold text-green-600">
        All Properties Compliant
      </h1>
    );
  }

  const label =
    attentionCount === 1
      ? "1 Property Needs Attention"
      : `${attentionCount} Properties Need Attention`;

  return <h1 className="text-4xl font-bold text-red-600">{label}</h1>;
}
