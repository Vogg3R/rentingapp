import { ListingDetailPage } from "@/components/listings/ListingDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IlanDetayPage({ params }: PageProps) {
  const { id } = await params;
  return <ListingDetailPage listingId={id} />;
}
