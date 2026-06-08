export interface ListingOwnerPreview {
  id: string;
  name: string | null;
  avatar_base64: string | null;
}

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
  owner?: ListingOwnerPreview | null;
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
