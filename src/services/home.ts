import type { CategoryDTO, ProductDTO, ReviewDTO } from "@/types";
import { http } from "./http";

export type HomePayload = {
  categories: CategoryDTO[];
  products: ProductDTO[];
  latestAdditions: ProductDTO[];
  mostDemanded: ProductDTO[];
  approvedReviews: ReviewDTO[];
};

export async function fetchHome(): Promise<HomePayload> {
  const { data } = await http.get<HomePayload>("/api/home", {
    params: { _t: Date.now() },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return data;
}
