export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  status: string;
  external_ref: string | null;
  created_at: string;
}

export interface WalletSummary {
  wallet: Wallet;
  transactions: WalletTransaction[];
}

export interface DepositResponse {
  wallet: Wallet | null;
  mode: string;
  message: string;
  checkout_url: string | null;
  payment_token: string | null;
}
