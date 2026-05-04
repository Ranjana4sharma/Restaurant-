import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Reservation } from "@/lib/models/Reservation";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    const status = String(body.status ?? "");
    if (!["pending", "confirmed", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await connectDB();
    const doc = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, status: doc.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await connectDB();
    const doc = await Reservation.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 });
  }
}
