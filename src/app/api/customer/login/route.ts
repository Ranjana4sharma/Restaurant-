import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";
import { jsonWithCustomerSession } from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Name/Phone and password are required" },
        { status: 400 }
      );
    }

    // Try finding by name or phone
    const customer = await Customer.findOne({ 
      $or: [
        { name: identifier },
        { phone: identifier }
      ]
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return await jsonWithCustomerSession(customer._id.toString(), customer.phone);
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
