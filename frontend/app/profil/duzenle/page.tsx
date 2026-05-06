import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export default function EditProfilePage() {
  return (
    <InteractivePageShell className="bg-slate-900 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/profil"
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Profile geri dön"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Profili Duzenle</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-700"
          >
            <Save className="size-4" />
            Kaydet
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="min-w-0 space-y-5 lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
              <div className="relative h-56 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800">
                <div className="absolute inset-0 bg-black/35" />
                <button
                  type="button"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-100 transition-colors hover:bg-black/15"
                >
                  <Camera className="size-7" />
                  <span className="text-sm font-medium">
                    Kapak Fotografini Yukle
                  </span>
                </button>
              </div>

              <div className="relative border-t border-slate-700 p-4 pt-14">
                <div className="absolute -top-10 left-4">
                  <div className="relative size-20 overflow-hidden rounded-full border-4 border-slate-800 bg-slate-700">
                    <div className="flex h-full items-center justify-center text-sm font-bold">
                      AY
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 inline-flex size-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200"
                      aria-label="Profil fotografini degistir"
                    >
                      <Camera className="size-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-bold">Ahmet Yilmaz</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
              <h2 className="text-lg font-bold">Onay Durumu</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  <Smartphone className="size-3.5" />
                  Telefon Onayli
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="size-3.5" />
                  E-Posta Onayli
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="size-3.5" />
                  Kimlik Dogrulanmis
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Rozetler, dogrulama islemi tamamlandiginda otomatik guncellenir.
              </p>

              <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-200">E-Posta Adresi</span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700"
                  >
                    Doğrula
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-200">Telefon Numarası</span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700"
                  >
                    Doğrula
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-slate-700 bg-slate-800 p-5 lg:col-span-7">
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Adi Soyadi" placeholder="Ahmet Yilmaz" />
                <Field label="Konum" placeholder="Lefkosa, Kibris" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                  Hakkimda
                </label>
                <textarea
                  rows={5}
                  defaultValue="Selam! Doga fotografciligi okuyorum. Cekim yapmadigim zamanlarda ekipmanlarimi ve kamp malzemelerimi kiraya veririm. Esyalarima kendi ekipmanim gibi bakarim, kiralayanlardan da aynisini beklerim."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none ring-blue-500/30 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Instagram" placeholder="@kullaniciadi" />
                <Field
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/kullaniciadi"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="E-Posta" placeholder="ahmet.yilmaz@email.com" />
                <Field label="Yeni Sifre" placeholder="Yeni şifrenizi girin" />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500"
                >
                  Degisiklikleri Kaydet
                </button>
                <button
                  type="button"
                  className="rounded-xl px-2 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                >
                  Vazgec
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </InteractivePageShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none ring-blue-500/30 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2"
      />
    </div>
  );
}
