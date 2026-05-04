import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RentalCard } from "@/components/rental/RentalCard";
import { resolveListingsForDisplay } from "@/lib/listings";
import { fetchRootApi } from "@/services/api";

export default async function Home() {
  const data = await fetchRootApi();
  const listings = resolveListingsForDisplay(data);

  return (
    <>
      <AppHeader apiMessage={data.mesaj} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-28 pt-6 md:pb-10 md:pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl">
              Öne çıkan ilanlar
            </h1>
            <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">
              Müsait ekipmanları keşfedin veya yakında tekrar deneyin.
            </p>
          </div>
          <button
            type="button"
            className="hidden rounded-lg border border-secondary px-4 py-2 text-sm font-bold text-secondary shadow-sm transition-colors hover:bg-secondary/10 sm:inline-flex"
          >
            Tümünü gör
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <RentalCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
      <SiteFooter className="pb-28 md:pb-6" />
      <BottomNavigation />
    </>
  );
}
