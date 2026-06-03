export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  daily_price: number;
  min_days: number;
  max_days: number;
  location: string;
  status: string;
  created_at: string;
}

export interface ListingCreatePayload {
  title: string;
  description: string;
  category: string;
  daily_price: number;
  min_days: number;
  max_days: number;
  location: string;
}
