import { http } from "./http";

export type SiteSettingsDTO = {
  heroImages: [string, string, string];
  restaurantAddress: string;
  restaurantInstruction: string;
  restaurantPhone: string;
  paymentQrImage: string;
  landingHeroImage: string;
  landingHeroTitle: string;
  landingHeroSubtitle: string;
  visionTitle: string;
  visionDescription: string;
  experienceCards: [string, string, string];
  landingGalleryImages: string[];
};

function triplet(raw: string[] | undefined): [string, string, string] {
  const a = raw?.[0] ?? "";
  const b = raw?.[1] ?? "";
  const c = raw?.[2] ?? "";
  return [a, b, c];
}

function normalizeResponse(data: Record<string, unknown>): SiteSettingsDTO {
  return {
    heroImages: triplet(data.heroImages as string[] | undefined),
    restaurantAddress: String(data.restaurantAddress ?? "").trim(),
    restaurantInstruction: String(data.restaurantInstruction ?? "").trim(),
    restaurantPhone: String(data.restaurantPhone ?? "").trim(),
    paymentQrImage: String(data.paymentQrImage ?? "").trim(),
    landingHeroImage: String(data.landingHeroImage ?? "").trim(),
    landingHeroTitle: String(data.landingHeroTitle ?? "").trim(),
    landingHeroSubtitle: String(data.landingHeroSubtitle ?? "").trim(),
    visionTitle: String(data.visionTitle ?? "").trim(),
    visionDescription: String(data.visionDescription ?? "").trim(),
    experienceCards: triplet(data.experienceCards as string[] | undefined),
    landingGalleryImages: Array.isArray(data.landingGalleryImages)
      ? (data.landingGalleryImages as unknown[])
          .map((x) => String(x ?? "").trim())
          .filter((x) => x.length > 0)
      : [],
  };
}

export async function fetchSettings(): Promise<SiteSettingsDTO> {
  const { data } = await http.get<Record<string, unknown>>("/api/settings", {
    headers: { "Cache-Control": "no-cache" },
  });
  return normalizeResponse(data);
}

export async function updateSettings(
  payload: SiteSettingsDTO
): Promise<SiteSettingsDTO> {
  const { data } = await http.put<Record<string, unknown>>("/api/settings", {
    heroImages: payload.heroImages,
    restaurantAddress: payload.restaurantAddress,
    restaurantInstruction: payload.restaurantInstruction,
    restaurantPhone: payload.restaurantPhone,
    paymentQrImage: payload.paymentQrImage,
    landingHeroImage: payload.landingHeroImage,
    landingHeroTitle: payload.landingHeroTitle,
    landingHeroSubtitle: payload.landingHeroSubtitle,
    visionTitle: payload.visionTitle,
    visionDescription: payload.visionDescription,
    experienceCards: payload.experienceCards,
    landingGalleryImages: payload.landingGalleryImages,
  });
  return normalizeResponse(data);
}
