import type { Metadata } from "next";
import { RequestListingFormPage } from "@/components/request-listing/RequestListingFormPage";

export const metadata: Metadata = {
  title: "İstek ilanı aç | EldenEle",
  description:
    "Aradığınız ürünü, bütçenizi ve teslimat tercihlerinizi girerek istek ilanı oluşturun.",
};

export default function IstekIlaniPage() {
  return <RequestListingFormPage />;
}
