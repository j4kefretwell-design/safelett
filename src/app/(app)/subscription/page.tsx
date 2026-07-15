import SubscriptionClient from "@/components/subscription/SubscriptionClient";

interface SubscriptionPageProps {
  searchParams?: Promise<{ trial?: string }>;
}

export default async function SubscriptionPage({
  searchParams,
}: SubscriptionPageProps) {
  const params = searchParams ? await searchParams : {};
  const trialEnded = params.trial === "ended";

  return <SubscriptionClient trialEnded={trialEnded} />;
}
