import type { ApiRootResponse, RentalListing, RentalStatus } from "@/types/api";
import type { Listing } from "@/types/listings";

/** `GET /listings` ham yanıtını (`Listing`) kart için `RentalListing`'e dönüştürür. */
export function mapListingToRental(listing: Listing): RentalListing {
  const status: RentalStatus = listing.status === "active" ? "available" : "rented";
  return {
    id: listing.id,
    title: listing.title,
    imageUrl: listing.image_base64 ?? null,
    status,
    pricePerDay: Number(listing.daily_price),
    category: listing.category,
    sellerName: listing.owner?.name ?? undefined,
    sellerAvatarUrl: listing.owner?.avatar_base64 ?? undefined,
  };
}

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
  const hasValidImageUrl =
    o.imageUrl === undefined ||
    o.imageUrl === null ||
    typeof o.imageUrl === "string";

  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    hasValidImageUrl &&
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
