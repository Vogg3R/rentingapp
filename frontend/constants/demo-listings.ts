import type { RentalListing } from "@/types/api";

/**
 * Backend henüz `listings` döndürmüyorsa tasarımı göstermek için örnek veri.
 * API `listings` eklediğinde bu dizi kullanılmaz.
 */
export const DEMO_LISTINGS: RentalListing[] = [
  {
    id: "demo-1",
    title: "Elektrikli Scooter — Günlük",
    imageUrl: "https://picsum.photos/seed/p2p-scooter/800/520",
    status: "available",
    pricePerDay: 149,
  },
  {
    id: "demo-2",
    title: "Profesyonel Kamera Seti",
    imageUrl: "https://picsum.photos/seed/p2p-camera/800/520",
    status: "rented",
    pricePerDay: 320,
  },
  {
    id: "demo-3",
    title: "Taşınabilir Jeneratör 2kW",
    imageUrl: "https://picsum.photos/seed/p2p-generator/800/520",
    status: "available",
    pricePerDay: 275,
  },
  {
    id: "demo-4",
    title: "Kamp Çadırı 4 Kişilik",
    imageUrl: "https://picsum.photos/seed/p2p-tent/800/520",
    status: "available",
    pricePerDay: 95,
  },
];
