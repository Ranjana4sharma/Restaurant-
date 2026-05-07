import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Offer } from "@/lib/models/Offer";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const body = await req.json();
    const offer = await Offer.findByIdAndUpdate(resolvedParams.id, body, { returnDocument: "after" });
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    return NextResponse.json(offer);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const offer = await Offer.findByIdAndDelete(resolvedParams.id);
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
