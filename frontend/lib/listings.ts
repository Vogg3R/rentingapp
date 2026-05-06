import { DEMO_LISTINGS } from "@/constants/demo-listings";
import type { ApiRootResponse, RentalListing } from "@/types/api";

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

  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.imageUrl === "string" &&
    (o.status === "available" || o.status === "rented") &&
    typeof o.pricePerDay === "number" &&
    Number.isFinite(o.pricePerDay) &&
    hasValidSellerName &&
    hasValidSellerRating &&
    hasValidSellerAvatarUrl
  );
}

/** API'den gelen liste varsa onu kullan; yoksa demo veriyi döndürür. */
export function resolveListingsForDisplay(data: ApiRootResponse): RentalListing[] {
  const raw = data.listings;
  if (!Array.isArray(raw) || raw.length === 0) return DEMO_LISTINGS;
  const valid = raw.filter(isRentalListing);
  return valid.length > 0 ? valid : DEMO_LISTINGS;
}
