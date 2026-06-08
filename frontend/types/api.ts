/** Kiralama kartında gösterilecek kayıt (API ile hizalı tip). */
export type RentalStatus = "available" | "rented";

export interface RentalListing {
  id: string;
  title: string;
  imageUrl: string;
  status: RentalStatus;
  pricePerDay: number;
  /** Kategori slug — örn. kamp-dis-mekan */
  category?: string;
  sellerName?: string;
  sellerRating?: number;
  sellerAvatarUrl?: string;
}

export interface ApiHomeItemRequest {
  id: string;
  title: string;
  maxDailyBudget: number;
  durationDays: number;
  location: string;
}

/** Kök endpoint yanıtı: mevcut `mesaj` alanı korunur; `listings` isteğe bağlı. */
export interface ApiRootResponse {
  mesaj: string;
  listings?: RentalListing[];
  itemRequests?: ApiHomeItemRequest[];
}
