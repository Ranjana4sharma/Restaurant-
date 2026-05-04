import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Offer } from "@/lib/models/Offer";

export async function GET() {
  try {
    await connectDB();
    await Offer.deleteMany({});
    await Offer.insertMany([
      {
        title: "Royal Weekend Feast",
        description: "Get a majestic 20% discount on your favorite platters. Valid on all orders above ₹499.",
        discountValue: 20,
        discountType: "percentage",
        maxDiscount: 500,
        minOrderValue: 499,
        isActive: true,
        isAutoApply: true
      },
      {
        title: "First Royal Bite",
        description: "Experience royalty with ₹150 off on your first major feast. Valid on orders above ₹799.",
        discountValue: 150,
        discountType: "fixed",
        minOrderValue: 799,
        isActive: true,
        isAutoApply: false
      }
    ]);
    return NextResponse.json({ message: "Two royal offers seeded successfully" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
