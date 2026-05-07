import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { Product } from "@/lib/models/Product";
import { Order } from "@/lib/models/Order";
import { NavbarSettings } from "@/lib/models/NavbarSettings";
import { Category } from "@/lib/models/Category";
import { toProductDTO } from "@/lib/product-dto";
import { categoryDocToDTO } from "@/lib/category-dto";

const KEY = "main";

const DEFAULTS = {
  heroImage:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=80",
  heroTitle: "The Royal Platter",
  heroSubtitle:
    "A regal dining experience where fire, flavor, and finesse meet on every plate.",
  visionTitle: "Our Vision",
  visionDescription:
    "To craft memorable dining moments through bold flavors, elegant presentation, and heartfelt hospitality.",
  experienceCards: [
    "Wood-fired craft pizzas and signature bakery plates",
    "Chef-led Chinese specials, premium shakes, and coffee ritual",
    "Seasonal ingredients, refined plating, and warm service",
  ] as [string, string, string],
  galleryImages: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1800&q=80",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1800&q=80",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1800&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1800&q=80",
  ] as string[],
};

function triplet(raw: unknown): [string, string, string] {
  const arr = Array.isArray(raw) ? raw : [];
  const out = arr.slice(0, 3).map((x) => (typeof x === "string" ? x.trim() : ""));
  while (out.length < 3) out.push("");
  return [out[0] ?? "", out[1] ?? "", out[2] ?? ""];
}

export async function GET() {
  try {
    await connectDB();
    const [settingsDocRaw, navbarDoc, productsDoc, catDocs, demandRows] = await Promise.all([
      SiteSettings.findOne({ key: KEY }).lean(),
      NavbarSettings.findOne({ key: KEY }).lean(),
      Product.find().populate({ path: "categoryId", select: "name" }).sort({ createdAt: -1 }).lean(),
      Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
      Order.aggregate<{ _id: string; qty: number }>([
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", qty: { $sum: "$items.quantity" } } },
        { $sort: { qty: -1 } },
        { $limit: 20 },
      ]),
    ]);

    const settingsDoc = settingsDocRaw ?? null;
    const needSeed =
      !settingsDoc ||
      !String(settingsDoc.landingHeroImage ?? "").trim() ||
      !String(settingsDoc.landingHeroTitle ?? "").trim() ||
      !String(settingsDoc.landingHeroSubtitle ?? "").trim() ||
      !String(settingsDoc.visionTitle ?? "").trim() ||
      !String(settingsDoc.visionDescription ?? "").trim() ||
      !Array.isArray(settingsDoc.experienceCards) ||
      settingsDoc.experienceCards.filter((x) => String(x ?? "").trim()).length === 0 ||
      !Array.isArray(settingsDoc.landingGalleryImages) ||
      settingsDoc.landingGalleryImages.filter((x) => String(x ?? "").trim()).length === 0;

    if (needSeed) {
      await SiteSettings.findOneAndUpdate(
        { key: KEY },
        {
          $set: {
            landingHeroImage:
              String(settingsDoc?.landingHeroImage ?? "").trim() || DEFAULTS.heroImage,
            landingHeroTitle:
              String(settingsDoc?.landingHeroTitle ?? "").trim() || DEFAULTS.heroTitle,
            landingHeroSubtitle:
              String(settingsDoc?.landingHeroSubtitle ?? "").trim() || DEFAULTS.heroSubtitle,
            visionTitle: String(settingsDoc?.visionTitle ?? "").trim() || DEFAULTS.visionTitle,
            visionDescription:
              String(settingsDoc?.visionDescription ?? "").trim() || DEFAULTS.visionDescription,
            experienceCards:
              Array.isArray(settingsDoc?.experienceCards) &&
              settingsDoc.experienceCards.filter((x) => String(x ?? "").trim()).length > 0
                ? settingsDoc.experienceCards
                : DEFAULTS.experienceCards,
            landingGalleryImages:
              Array.isArray(settingsDoc?.landingGalleryImages) &&
              settingsDoc.landingGalleryImages.filter((x) => String(x ?? "").trim()).length > 0
                ? settingsDoc.landingGalleryImages
                : DEFAULTS.galleryImages,
          },
        },
        { upsert: true, returnDocument: "after", runValidators: true }
      );
    }

    const finalSettings = (await SiteSettings.findOne({ key: KEY }).lean()) ?? settingsDoc;

    const products = productsDoc.map((d) =>
      toProductDTO({
        ...d,
        _id: d._id,
        variants: d.variants as { label: string; price: number }[] | undefined,
      })
    );

    const categories = catDocs.map((d) => categoryDocToDTO({ ...d, _id: d._id }));

    const chefSpecials = products.filter((p) => p.isChefSpecial).slice(0, 12);
    const signatureDishes = products.filter((p) => p.isSignatureDish).slice(0, 12);
    const famousFlagged = products.filter((p) => p.isFamousDish);
    const demandMap = new Map(demandRows.map((r) => [String(r._id), r.qty]));
    const mostFamousDishes = (
      famousFlagged.length > 0 ? famousFlagged : products.filter((p) => demandMap.has(p._id))
    )
      .sort((a, b) => (demandMap.get(b._id) ?? 0) - (demandMap.get(a._id) ?? 0))
      .slice(0, 12);

    const response = NextResponse.json({
      brandName: String(navbarDoc?.brand ?? "").trim() || "The Royal Platter",
      mottoLine:
        String(navbarDoc?.tagline ?? "").trim() ||
        "Where every plate tells a royal story.",
      heroImage: String(finalSettings?.landingHeroImage ?? "").trim(),
      heroTitle: String(finalSettings?.landingHeroTitle ?? "").trim(),
      heroSubtitle: String(finalSettings?.landingHeroSubtitle ?? "").trim(),
      visionTitle: String(finalSettings?.visionTitle ?? "").trim(),
      visionDescription: String(finalSettings?.visionDescription ?? "").trim(),
      experienceCards: triplet(finalSettings?.experienceCards),
      landingGalleryImages: Array.isArray(finalSettings?.landingGalleryImages)
        ? finalSettings.landingGalleryImages
            .map((x) => String(x ?? "").trim())
            .filter((x) => x.length > 0)
            .slice(0, 12)
        : [],
      chefSpecials,
      signatureDishes,
      mostFamousDishes,
      categories,
    });
    response.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load landing data" }, { status: 500 });
  }
}
