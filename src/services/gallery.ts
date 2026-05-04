import { http } from "./http";

export async function fetchGallery(): Promise<string[]> {
  const { data } = await http.get<{ images: string[] }>("/api/gallery", {
    params: { _t: Date.now() },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return Array.isArray(data.images) ? data.images : [];
}

export async function updateGalleryAdmin(images: string[]): Promise<string[]> {
  const { data } = await http.put<{ images: string[] }>("/api/gallery", { images });
  return Array.isArray(data.images) ? data.images : [];
}
