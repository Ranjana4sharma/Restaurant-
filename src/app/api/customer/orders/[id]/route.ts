import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { getCustomerSession } from "@/lib/customer-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security: Ensure user only deletes their own order
    const isOwner = 
      (order.customerId && order.customerId.toString() === session.customerId) ||
      (order.customerPhone === session.phone);

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Order.findByIdAndDelete(params.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
