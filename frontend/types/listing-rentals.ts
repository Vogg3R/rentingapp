export interface ListingRentalRequest {
  id: string;
  listing_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
  status: string;
  created_at: string;
  conversation_id: string | null;
}

export interface ListingRentalRequestPayload {
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
}

export interface ListingRentalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string | null;
  body: string;
  created_at: string;
}

export interface ListingRentalConversationSummary {
  id: string;
  listing_id: string;
  listing_title: string;
  counterparty_name: string | null;
  role: "owner" | "renter";
  status: string;
  total_price: number;
  total_days: number;
  start_date: string;
  end_date: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
}
