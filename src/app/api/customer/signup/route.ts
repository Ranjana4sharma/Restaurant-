import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";
import Otp from "@/lib/models/Otp";
import bcrypt from "bcryptjs";
import { jsonWithCustomerSession } from "@/lib/customer-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[SIGNUP] Request body:", body);

    let { email, password, name, address } = body;

    if (!email || !password) {
      console.error("[SIGNUP] Missing fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Normalize
    email = email.toLowerCase().trim();

    await connectDB();

    // 1. Check if user exists
    const existing = await Customer.findOne({ email });
    if (existing) {
      console.error("[SIGNUP] Email already registered:", email);
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 2. Create user
    console.log("[SIGNUP] Creating customer:", email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      address: address || "", 
    });

    // 3. Generate Token and Set Cookie
    console.log("[SIGNUP] Success, generated session for:", customer._id);
    return await jsonWithCustomerSession(customer._id.toString(), customer.email || "");
  } catch (error) {
    console.error("[SIGNUP] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
