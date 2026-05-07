import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/lib/models/Otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[OTP_VERIFY] Request body:", body);

    let { email, otp, type } = body;

    if (!email || !otp || !type) {
      console.error("[OTP_VERIFY] Missing fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Normalize email
    email = email.toLowerCase().trim();
    otp = otp.trim();

    await connectDB();

    console.log(`[OTP_VERIFY] Looking for: email=${email}, otp=${otp}, type=${type}`);
    const record = await Otp.findOne({ email, otp, type });
    console.log("[OTP_VERIFY] Found record:", record);

    if (!record) {
      console.error("[OTP_VERIFY] No matching record found");
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    console.log("[OTP_VERIFY] Success");
    return NextResponse.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("[OTP_VERIFY] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
