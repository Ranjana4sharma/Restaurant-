import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { getCustomerSession } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No orders selected" }, { status: 400 });
    }

    // Security: Only delete orders belonging to this user (by ID or Phone)
    await Order.deleteMany({
      _id: { $in: ids },
      customerId: session.customerId
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete orders" }, { status: 500 });
  }
}
