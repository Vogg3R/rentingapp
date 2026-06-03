import { RequestDetailPage } from "@/components/requests/RequestDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TalepDetayPage({ params }: PageProps) {
  const { id } = await params;
  return <RequestDetailPage requestId={id} />;
}
