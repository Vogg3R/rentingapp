import type { Listing } from "@/types/listings";
import type { Offer, ItemRequest } from "@/types/requests";

/** Başka kullanıcıların görebileceği profil (e-posta, telefon, bakiye yok). */
export interface PublicProfile {
  user_id: string;
  name: string | null;
  location: string | null;
  bio: string | null;
  instagram: string | null;
  linkedin: string | null;
  avatar_base64: string | null;
  cover_base64: string | null;
  listings_count: number;
  listings: Listing[];
}

export interface ProfileSummary {
  user_id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  location: string | null;
  bio: string | null;
  instagram: string | null;
  linkedin: string | null;
  avatar_base64: string | null;
  cover_base64: string | null;
  listings_count: number;
  requests_count: number;
  offers_count: number;
  deals_count: number;
  listings: Listing[];
  requests: ItemRequest[];
  offers: Offer[];
}

export interface ProfileUpdatePayload {
  name?: string | null;
  location?: string | null;
  bio?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  avatar_base64?: string | null;
  cover_base64?: string | null;
}
