import { Suspense } from "react";
import { WalletPage } from "@/components/wallet/WalletPage";

export default function CuzdanRoute() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm">Cüzdan yükleniyor…</p>}>
      <WalletPage />
    </Suspense>
  );
}
