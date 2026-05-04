import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Offer } from "@/lib/models/Offer";

export async function GET() {
  try {
    await connectDB();
    const offers = await Offer.find({ isActive: true }).lean();
    return NextResponse.json(offers);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}
