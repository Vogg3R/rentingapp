import type { Metadata } from "next";
import { UserProfilePage } from "@/components/profile/UserProfilePage";

export const metadata: Metadata = {
  title: "Kullanıcı Profili | EldenEle",
  description:
    "Kullanıcı bilgileri, güven rozetleri, ilanlar, istekler ve değerlendirmeler.",
};

export default function ProfilPage() {
  return <UserProfilePage />;
}
