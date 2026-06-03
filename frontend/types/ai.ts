/** AI ilan asistanı yanıtı (POST /ai/generate-listing) */
export interface AIGenerateListingResponse {
  title: string;
  description: string;
  category: string;
  daily_price: number;
}
