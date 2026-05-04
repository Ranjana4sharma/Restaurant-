import type { ReviewDTO } from "@/types";
import { http } from "./http";

export async function fetchApprovedReviews(): Promise<ReviewDTO[]> {
  const { data } = await http.get<ReviewDTO[]>("/api/reviews");
  return data;
}

export async function submitReview(payload: {
  customerName: string;
  rating: number;
  comment: string;
}): Promise<ReviewDTO> {
  const { data } = await http.post<ReviewDTO>("/api/reviews", payload);
  return data;
}

export async function fetchReviewsAdmin(): Promise<ReviewDTO[]> {
  const { data } = await http.get<ReviewDTO[]>("/api/reviews?all=1");
  return data;
}

export async function updateReviewAdmin(body: {
  id: string;
  approved?: boolean;
  rating?: number;
  customerName?: string;
  comment?: string;
}): Promise<ReviewDTO> {
  const { data } = await http.put<ReviewDTO>("/api/reviews", body);
  return data;
}

export async function deleteReviewAdmin(id: string): Promise<void> {
  await http.delete(`/api/reviews/${id}`);
}
