import type { ApiRootResponse, RentalListing } from "@/types/api";

/** Anasayfa kategori filtresi */
export function filterListingsByCategory(
  listings: RentalListing[],
  categorySlug: string | null
): RentalListing[] {
  if (!categorySlug) return listings;
  return listings.filter((item) => item.category === categorySlug);
}

function isRentalListing(value: unknown): value is RentalListing {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  const hasValidSellerName =
    o.sellerName === undefined || typeof o.sellerName === "string";
  const hasValidSellerRating =
    o.sellerRating === undefined ||
    (typeof o.sellerRating === "number" && Number.isFinite(o.sellerRating));
  const hasValidSellerAvatarUrl =
    o.sellerAvatarUrl === undefined || typeof o.sellerAvatarUrl === "string";
  const hasValidCategory =
    o.category === undefined || typeof o.category === "string";

  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.imageUrl === "string" &&
    (o.status === "available" || o.status === "rented") &&
    typeof o.pricePerDay === "number" &&
    Number.isFinite(o.pricePerDay) &&
    hasValidSellerName &&
    hasValidSellerRating &&
    hasValidSellerAvatarUrl &&
    hasValidCategory
  );
}

/** API'den gelen geçerli ilan listesini döndürür; yoksa boş dizi. */
export function resolveListingsForDisplay(data: ApiRootResponse): RentalListing[] {
  const raw = data.listings;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.filter(isRentalListing);
}
