import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/lib/models/Otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[OTP_SEND] Request body:", body);

    let { email, type } = body;

    if (!email || !type) {
      console.error("[OTP_SEND] Missing email or type");
      return NextResponse.json({ error: "Email and type are required" }, { status: 400 });
    }

    // Normalize email
    email = email.toLowerCase().trim();

    await connectDB();

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[OTP_SEND] Generated OTP for ${email} (${type}): ${otpCode}`);

    // Save to DB (update if exists)
    const record = await Otp.findOneAndUpdate(
      { email, type },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );
    
    console.log("[OTP_SEND] DB Record updated:", record);

    // Send Email
    const sent = await sendOtpEmail(email, otpCode);

    if (!sent) {
      console.error("[OTP_SEND] Failed to send email via Nodemailer");
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    console.log("[OTP_SEND] Success");
    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("[OTP_SEND] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
