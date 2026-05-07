import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const customer = await Customer.findById(session.customerId);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        email: customer.email,
        gender: customer.gender,
        birthDate: customer.birthDate,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { name, address, email, gender, birthDate } = body;

    const updated = await Customer.findByIdAndUpdate(
      session.customerId,
      {
        $set: {
          name,
          address,
          email,
          gender,
          birthDate,
        },
      },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
        email: updated.email,
        gender: updated.gender,
        birthDate: updated.birthDate,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
