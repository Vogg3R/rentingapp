/** Admin panelinde bekleyen para çekme talebi (backend AdminWithdrawalRead ile hizalı). */
export interface AdminWithdrawal {
  id: string;
  user_id: string;
  user_name: string | null;
  amount: number;
  iban: string | null;
  created_at: string;
}

/** Admin panelindeki kullanıcı satırı (backend AdminUserRead ile hizalı). */
export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

/** Admin iade ekranındaki anlaşmazlıktaki kiralama işlemi (backend AdminDealRead ile hizalı). */
export interface AdminDeal {
  id: string;
  item_request_title: string;
  requester_name: string | null;
  supplier_name: string | null;
  amount: number;
  escrow_status: string;
  deal_status: string;
  created_at: string;
}
