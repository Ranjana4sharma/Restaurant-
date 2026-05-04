import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";

const KEY = "main";

function normalizeImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0)
    .slice(0, 24);
}

export async function GET() {
  try {
    await connectDB();
    const doc = await SiteSettings.findOne({ key: KEY }).lean();
    const images = normalizeImages(doc?.landingGalleryImages);
    const response = NextResponse.json({ images });
    response.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const body = (await request.json()) as { images?: unknown };
    const images = normalizeImages(body.images);
    await SiteSettings.findOneAndUpdate(
      { key: KEY },
      { $set: { landingGalleryImages: images } },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ ok: true, images });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 });
  }
}
