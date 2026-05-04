import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { Order } from "@/lib/models/Order";
import { Review } from "@/lib/models/Review";
import { categoryDocToDTO } from "@/lib/category-dto";
import { toProductDTO } from "@/lib/product-dto";
import type { ReviewDTO } from "@/types";

function toReviewDTO(d: {
  _id: { toString: () => string };
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}): ReviewDTO {
  return {
    _id: d._id.toString(),
    customerName: d.customerName,
    rating: d.rating,
    comment: d.comment,
    approved: d.approved,
    createdAt: d.createdAt?.toISOString(),
    updatedAt: d.updatedAt?.toISOString(),
  };
}

export async function GET() {
  try {
    await connectDB();
    const [catDocs, productDocs, demandRows, reviews] = await Promise.all([
      Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
      Product.find().populate({ path: "categoryId", select: "name" }).sort({ createdAt: -1 }).lean(),
      Order.aggregate<{ _id: string; qty: number }>([
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", qty: { $sum: "$items.quantity" } } },
        { $sort: { qty: -1 } },
        { $limit: 8 },
      ]),
      Review.find({ approved: true }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const categories = catDocs.map((d) => categoryDocToDTO({ ...d, _id: d._id }));
    const products = productDocs.map((d) =>
      toProductDTO({
        ...d,
        _id: d._id,
        variants: d.variants as { label: string; price: number }[] | undefined,
      })
    );
    const latestAdditions = products.slice(0, 8);
    const demandMap = new Map(demandRows.map((r) => [String(r._id), r.qty]));
    const mostDemanded = products
      .filter((p) => demandMap.has(p._id))
      .sort((a, b) => (demandMap.get(b._id) ?? 0) - (demandMap.get(a._id) ?? 0))
      .slice(0, 8);

    const res = NextResponse.json({
      categories,
      products,
      latestAdditions,
      mostDemanded,
      approvedReviews: reviews.map((r) => toReviewDTO({ ...r, _id: r._id })),
    });
    res.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load home data" }, { status: 500 });
  }
}
