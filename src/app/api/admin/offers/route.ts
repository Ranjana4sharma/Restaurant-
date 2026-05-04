import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Offer } from "@/lib/models/Offer";

export async function GET() {
  try {
    await connectDB();
    const offers = await Offer.find().sort({ createdAt: -1 });
    return NextResponse.json(offers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const offer = await Offer.create(body);
    return NextResponse.json(offer);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
