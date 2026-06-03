export interface ItemRequest {
  id: string;
  requester_id: string;
  title: string;
  category: string;
  description: string;
  max_daily_budget: number;
  duration_days: number;
  location: string;
  status: string;
  created_at: string;
}

export interface ItemRequestCreatePayload {
  title: string;
  category: string;
  description: string;
  max_daily_budget: number;
  duration_days: number;
  location: string;
}

export interface Offer {
  id: string;
  item_request_id: string;
  supplier_id: string;
  price_amount: number;
  description: string;
  status: string;
  created_at: string;
}

export interface RentalDeal {
  id: string;
  item_request_id: string;
  accepted_offer_id: string;
  escrow_status: string;
  delivery_confirmed_at: string | null;
  deal_status: string;
  created_at: string;
}

export interface DealSummary {
  id: string;
  item_request_title: string;
  offer_price: number;
  escrow_status: string;
  deal_status: string;
  role: "requester" | "supplier";
  created_at: string;
}

export interface DealMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface HomeItemRequest {
  id: string;
  title: string;
  maxDailyBudget: number;
  durationDays: number;
  location: string;
}
