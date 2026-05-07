import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/lib/models/Review";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import type { ReviewDTO } from "@/types";

function toDTO(doc: {
  _id: mongoose.Types.ObjectId;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}): ReviewDTO {
  return {
    _id: doc._id.toString(),
    customerName: doc.customerName,
    rating: doc.rating,
    comment: doc.comment,
    approved: doc.approved,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "1";
    const admin = includeAll ? await isAdminSession() : false;
    const filter = includeAll && admin ? {} : { approved: true };
    const docs = await Review.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(docs.map((d) => toDTO({ ...d, _id: d._id })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const customerName = String(body.customerName ?? "").trim().slice(0, 60);
    const comment = String(body.comment ?? "").trim().slice(0, 500);
    const rating = Number(body.rating);
    if (!customerName || !comment || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
    }
    const doc = await Review.create({
      customerName,
      comment,
      rating,
      approved: false,
    });
    return NextResponse.json(toDTO(doc), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const patch: {
      customerName?: string;
      comment?: string;
      rating?: number;
      approved?: boolean;
    } = {};
    if (typeof body.customerName === "string") patch.customerName = body.customerName.trim().slice(0, 60);
    if (typeof body.comment === "string") patch.comment = body.comment.trim().slice(0, 500);
    if (typeof body.approved === "boolean") patch.approved = body.approved;
    if (body.rating !== undefined) {
      const rating = Number(body.rating);
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
      }
      patch.rating = rating;
    }
    const doc = await Review.findByIdAndUpdate(id, patch, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toDTO(doc.toObject()));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
