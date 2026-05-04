import type { CategoryDTO, ProductDTO } from "@/types";
import { http } from "./http";

export type LandingPayload = {
  brandName: string;
  mottoLine: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  visionTitle: string;
  visionDescription: string;
  experienceCards: [string, string, string];
  landingGalleryImages: string[];
  chefSpecials: ProductDTO[];
  signatureDishes: ProductDTO[];
  mostFamousDishes: ProductDTO[];
  categories: CategoryDTO[];
};

export async function fetchLanding(): Promise<LandingPayload> {
  const { data } = await http.get<LandingPayload>("/api/landing", {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    params: { _t: Date.now() },
  });
  return data;
}
