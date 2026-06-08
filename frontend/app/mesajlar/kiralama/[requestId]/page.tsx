import { ListingRentalChatPage } from "@/components/listings/ListingRentalChatPage";

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default async function KiralamaMesajPage({ params }: PageProps) {
  const { requestId } = await params;
  return <ListingRentalChatPage requestId={requestId} />;
}
