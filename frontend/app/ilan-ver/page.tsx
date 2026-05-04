import type { Metadata } from "next";
import { ListingFormPage } from "@/components/listing/ListingFormPage";

export const metadata: Metadata = {
  title: "İlan ver | EldenEle",
  description:
    "Eşyanızı listelemek için başlık, fotoğraf, açıklama ve kiralama şartlarını girin.",
};

export default function IlanVerPage() {
  return <ListingFormPage />;
}
