import type { Listing } from "@/types/listings";
import type { Offer, ItemRequest } from "@/types/requests";

export interface ProfileSummary {
  user_id: string;
  email: string | null;
  phone: string | null;
  listings_count: number;
  requests_count: number;
  offers_count: number;
  deals_count: number;
  listings: Listing[];
  requests: ItemRequest[];
  offers: Offer[];
}
