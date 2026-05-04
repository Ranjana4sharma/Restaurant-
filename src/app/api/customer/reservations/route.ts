import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Reservation } from "@/lib/models/Reservation";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    // Use phone number from session to fetch all reservations (linked by identity)
    const reservations = await Reservation.find({ phone: session.phone })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reservations);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}
