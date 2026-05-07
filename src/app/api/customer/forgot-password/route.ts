import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";
import Otp from "@/lib/models/Otp";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[FORGOT_PASSWORD] Request body:", body);

    let { email, password, otp } = body;

    if (!email || !password || !otp) {
      console.error("[FORGOT_PASSWORD] Missing fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Normalize
    email = email.toLowerCase().trim();
    otp = otp.trim();

    await connectDB();

    // 1. Verify OTP
    console.log(`[FORGOT_PASSWORD] Verifying OTP for ${email}`);
    const otpRecord = await Otp.findOne({ email, otp, type: "forgot_password" });
    if (!otpRecord) {
      console.error("[FORGOT_PASSWORD] Invalid OTP record for", email);
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // 2. Find Customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      console.error("[FORGOT_PASSWORD] Customer not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Update Password
    console.log("[FORGOT_PASSWORD] Updating password for:", email);
    const hashedPassword = await bcrypt.hash(password, 10);
    customer.password = hashedPassword;
    await customer.save();

    // 4. Cleanup OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    console.log("[FORGOT_PASSWORD] Success");
    return NextResponse.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("[FORGOT_PASSWORD] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
