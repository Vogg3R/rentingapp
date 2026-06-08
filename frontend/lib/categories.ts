import { LISTING_CATEGORIES } from "@/constants/listing-categories";

export function getCategoryLabel(value: string): string {
  const match = LISTING_CATEGORIES.find((c) => c.value === value);
  return match?.label ?? value;
}

export function getCategorySlugFromLabel(label: string): string | undefined {
  return LISTING_CATEGORIES.find((c) => c.label === label)?.value;
}

export const CATEGORY_LABELS = LISTING_CATEGORIES.map((c) => c.label);
