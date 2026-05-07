import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import { categoryDocToDTO } from "@/lib/category-dto";

export async function GET() {
  try {
    await connectDB();
    const docs = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    const response = NextResponse.json(
      docs.map((d) => categoryDocToDTO(d))
    );
    response.headers.set(
      "Cache-Control",
      "private, no-store, must-revalidate"
    );
    return response;
  } catch (e) {
    console.error("API Categories GET Error:", e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const image = typeof body.image === "string" ? body.image.trim().slice(0, 1000) : "";
    const parentIdRaw = typeof body.parentId === "string" ? body.parentId : "";
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const parentId =
      parentIdRaw && mongoose.Types.ObjectId.isValid(parentIdRaw)
        ? new mongoose.Types.ObjectId(parentIdRaw)
        : null;
    const last = await Category.findOne()
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();
    const nextSort = (last?.sortOrder ?? -1) + 1;
    const doc = await Category.create({
      name: name.trim(),
      sortOrder: nextSort,
      image,
      parentId,
    });
    return NextResponse.json(categoryDocToDTO(doc), { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
