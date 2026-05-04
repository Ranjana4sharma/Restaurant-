import { http } from "./http";

export type OfferDTO = {
  _id: string;
  title: string;
  description: string;
  discountValue: number;
  discountType: "percentage" | "fixed";
  maxDiscount?: number;
  minOrderValue?: number;
  isActive: boolean;
  isAutoApply: boolean;
};

export async function fetchOffers(): Promise<OfferDTO[]> {
  try {
    const res = await fetch("/api/offers");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
