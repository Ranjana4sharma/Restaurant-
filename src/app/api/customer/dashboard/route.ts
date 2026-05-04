import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { Customer } from "@/lib/models/Customer";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const customer = await Customer.findById(session.customerId).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const orders = await Order.find({ 
      $or: [
        { customerId: customer._id },
        { customerPhone: customer.phone }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Initials logic
    const initials = customer.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Calculate profile completion
    const allFields = ["name", "phone", "address", "email", "gender", "birthDate"];
    const filledFields = allFields.filter((f) => !!(customer as any)[f]);
    const missingFields = allFields.filter((f) => !(customer as any)[f]);
    const completionPercentage = Math.round((filledFields.length / allFields.length) * 100);

    return NextResponse.json({
      profile: {
        name: customer.name,
        initials,
        phone: customer.phone,
        address: customer.address,
        email: customer.email,
        gender: customer.gender,
        birthDate: customer.birthDate,
        completionPercentage,
        missingFields,
      },
      orders,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
