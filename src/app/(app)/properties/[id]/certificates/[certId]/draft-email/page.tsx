import { redirect } from "next/navigation";

interface DraftEmailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftEmailPage({ params }: DraftEmailPageProps) {
  const { id } = await params;
  redirect(`/properties/${id}`);
}
