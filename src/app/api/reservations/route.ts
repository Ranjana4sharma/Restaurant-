import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Reservation } from "@/lib/models/Reservation";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import type { ReservationDTO } from "@/types";

function toDTO(doc: any): ReservationDTO {
  return {
    _id: doc._id.toString(),
    trackId: doc.trackId,
    fullName: doc.fullName,
    phone: doc.phone,
    guests: doc.guests,
    reservationDate: doc.reservationDate,
    reservationTime: doc.reservationTime,
    notes: doc.notes ?? "",
    adminNote: doc.adminNote ?? "",
    status: doc.status,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function GET() {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const docs = await Reservation.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(docs.map((d) => toDTO({ ...d, _id: d._id })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load reservations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = String(body.fullName ?? "").trim().slice(0, 80);
    const phone = String(body.phone ?? "").trim().slice(0, 30);
    const guests = Number(body.guests ?? 0);
    const reservationDate = String(body.reservationDate ?? "").trim().slice(0, 20);
    const reservationTime = String(body.reservationTime ?? "").trim().slice(0, 20);
    const notes = String(body.notes ?? "").trim().slice(0, 400);
    if (!fullName || !phone || !reservationDate || !reservationTime) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
      return NextResponse.json({ error: "Guests must be between 1 and 20" }, { status: 400 });
    }
    const trackId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const doc = await Reservation.create({
      trackId,
      fullName,
      phone,
      guests,
      reservationDate,
      reservationTime,
      notes,
      status: "pending",
    });
    return NextResponse.json(toDTO(doc.toObject()), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
