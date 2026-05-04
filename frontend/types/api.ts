/** Kiralama kartında gösterilecek kayıt (API ile hizalı tip). */
export type RentalStatus = "available" | "rented";

export interface RentalListing {
  id: string;
  title: string;
  imageUrl: string;
  status: RentalStatus;
  pricePerDay: number;
}

/** Kök endpoint yanıtı: mevcut `mesaj` alanı korunur; `listings` isteğe bağlı. */
export interface ApiRootResponse {
  mesaj: string;
  listings?: RentalListing[];
}
