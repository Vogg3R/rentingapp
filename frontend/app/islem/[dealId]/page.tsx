import { DealWorkspacePage } from "@/components/deals/DealWorkspacePage";

interface PageProps {
  params: Promise<{ dealId: string }>;
}

export default async function IslemPage({ params }: PageProps) {
  const { dealId } = await params;
  return <DealWorkspacePage dealId={dealId} />;
}
