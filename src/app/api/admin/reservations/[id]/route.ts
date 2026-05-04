import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Reservation } from "@/lib/models/Reservation";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await connectDB();
    const body = await request.json();
    const { status, adminNote } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const doc = await Reservation.findByIdAndUpdate(
      id,
      { status, adminNote: adminNote ?? "" },
      { new: true }
    );

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
