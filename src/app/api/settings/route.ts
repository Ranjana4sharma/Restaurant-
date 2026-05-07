import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";

const KEY = "main";

function normalizeHeroImages(raw: unknown): [string, string, string] {
  const arr = Array.isArray(raw) ? raw : [];
  const urls = arr
    .slice(0, 3)
    .map((x) => (typeof x === "string" ? x.trim() : ""));
  while (urls.length < 3) urls.push("");
  return [urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""];
}

function str(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

type PublicSettings = {
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

function normalizeTriplet(raw: unknown): [string, string, string] {
  const arr = Array.isArray(raw) ? raw : [];
  const out = arr.slice(0, 3).map((x) => (typeof x === "string" ? x.trim() : ""));
  while (out.length < 3) out.push("");
  return [out[0] ?? "", out[1] ?? "", out[2] ?? ""];
}

function fromDoc(
  doc: {
    heroImages?: string[];
    restaurantAddress?: string | null;
    restaurantInstruction?: string | null;
    restaurantPhone?: string | null;
    paymentQrImage?: string | null;
    landingHeroImage?: string | null;
    landingHeroTitle?: string | null;
    landingHeroSubtitle?: string | null;
    visionTitle?: string | null;
    visionDescription?: string | null;
    experienceCards?: string[];
    landingGalleryImages?: string[];
  } | null
): PublicSettings {
  const heroImages: [string, string, string] = doc?.heroImages?.length
    ? normalizeHeroImages(doc.heroImages)
    : ["", "", ""];
  return {
    heroImages,
    restaurantAddress: (doc?.restaurantAddress ?? "").trim(),
    restaurantInstruction: (doc?.restaurantInstruction ?? "").trim(),
    restaurantPhone: (doc?.restaurantPhone ?? "").trim(),
    paymentQrImage: (doc?.paymentQrImage ?? "").trim(),
    landingHeroImage: (doc?.landingHeroImage ?? "").trim(),
    landingHeroTitle: (doc?.landingHeroTitle ?? "").trim(),
    landingHeroSubtitle: (doc?.landingHeroSubtitle ?? "").trim(),
    visionTitle: (doc?.visionTitle ?? "").trim(),
    visionDescription: (doc?.visionDescription ?? "").trim(),
    experienceCards: normalizeTriplet(doc?.experienceCards),
    landingGalleryImages: Array.isArray(doc?.landingGalleryImages)
      ? doc.landingGalleryImages
          .map((x) => (typeof x === "string" ? x.trim() : ""))
          .filter((x) => x.length > 0)
      : [],
  };
}

export async function GET() {
  try {
    await connectDB();
    const doc = await SiteSettings.findOne({ key: KEY }).lean();
    const response = NextResponse.json(fromDoc(doc));
    response.headers.set(
      "Cache-Control",
      "private, no-store, must-revalidate"
    );
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        heroImages: ["", "", ""] as [string, string, string],
        restaurantAddress: "",
        restaurantInstruction: "",
        restaurantPhone: "",
        paymentQrImage: "",
        landingHeroImage: "",
        landingHeroTitle: "",
        landingHeroSubtitle: "",
        visionTitle: "",
        visionDescription: "",
        experienceCards: ["", "", ""] as [string, string, string],
        landingGalleryImages: [] as string[],
        error: "settings_unavailable",
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const body = await request.json();
    const heroImages = normalizeHeroImages(body.heroImages);
    const restaurantAddress = str(body.restaurantAddress);
    const restaurantInstruction = str(body.restaurantInstruction);
    const restaurantPhone = str(body.restaurantPhone);
    const paymentQrImage = str(body.paymentQrImage);
    const landingHeroImage = str(body.landingHeroImage);
    const landingHeroTitle = str(body.landingHeroTitle);
    const landingHeroSubtitle = str(body.landingHeroSubtitle);
    const visionTitle = str(body.visionTitle);
    const visionDescription = str(body.visionDescription);
    const experienceCards = normalizeTriplet(body.experienceCards);
    const landingGalleryImages = Array.isArray(body.landingGalleryImages)
      ? body.landingGalleryImages
          .map((x: unknown) => (typeof x === "string" ? x.trim() : ""))
          .filter((x: string) => x.length > 0)
          .slice(0, 12)
      : [];

    await SiteSettings.findOneAndUpdate(
      { key: KEY },
      {
        $set: {
          heroImages,
          restaurantAddress,
          restaurantInstruction,
          restaurantPhone,
          paymentQrImage,
          landingHeroImage,
          landingHeroTitle,
          landingHeroSubtitle,
          visionTitle,
          visionDescription,
          experienceCards,
          landingGalleryImages,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true }
    );
    return NextResponse.json({
      ok: true,
      heroImages,
      restaurantAddress,
      restaurantInstruction,
      restaurantPhone,
      paymentQrImage,
      landingHeroImage,
      landingHeroTitle,
      landingHeroSubtitle,
      visionTitle,
      visionDescription,
      experienceCards,
      landingGalleryImages,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
