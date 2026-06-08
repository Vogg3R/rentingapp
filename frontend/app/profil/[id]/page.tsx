import { PublicProfilePage } from "@/components/profile/PublicProfilePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfileRoute({ params }: PageProps) {
  const { id } = await params;
  return <PublicProfilePage userId={id} />;
}
