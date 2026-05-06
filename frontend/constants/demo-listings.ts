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
    sellerName: "Ahmet Y.",
    sellerRating: 4.8,
    sellerAvatarUrl: "https://picsum.photos/seed/seller-ahmet/120/120",
  },
  {
    id: "demo-2",
    title: "Profesyonel Kamera Seti",
    imageUrl: "https://picsum.photos/seed/p2p-camera/800/520",
    status: "rented",
    pricePerDay: 320,
    sellerName: "Ayşe K.",
    sellerRating: 4.9,
    sellerAvatarUrl: "https://picsum.photos/seed/seller-ayse/120/120",
  },
  {
    id: "demo-3",
    title: "Taşınabilir Jeneratör 2kW",
    imageUrl: "https://picsum.photos/seed/p2p-generator/800/520",
    status: "available",
    pricePerDay: 275,
    sellerName: "Mehmet T.",
    sellerRating: 4.7,
    sellerAvatarUrl: "https://picsum.photos/seed/seller-mehmet/120/120",
  },
  {
    id: "demo-4",
    title: "Kamp Çadırı 4 Kişilik",
    imageUrl: "https://picsum.photos/seed/p2p-tent/800/520",
    status: "available",
    pricePerDay: 95,
    sellerName: "Zeynep A.",
    sellerRating: 4.8,
    sellerAvatarUrl: "https://picsum.photos/seed/seller-zeynep/120/120",
  },
];
