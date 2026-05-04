import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import { MIN_ORDER_AMOUNT } from "@/lib/order-constants";
import { generateOrderNumber } from "@/lib/order-number";
import type { OrderDTO, OrderItemDTO } from "@/types";

function toDTO(doc: {
  _id: { toString: () => string };
  orderNumber?: string | null;
  customerId?: any;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  items: Array<{
    productId: { toString: () => string };
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  appliedOffer?: any;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}): OrderDTO {
  return {
    _id: doc._id.toString(),
    orderNumber: doc.orderNumber ?? undefined,
    customerId: doc.customerId?.toString(),
    customerName: doc.customerName ?? undefined,
    customerPhone: doc.customerPhone ?? undefined,
    customerAddress: doc.customerAddress ?? undefined,
    items: doc.items.map(
      (i): OrderItemDTO => ({
        productId: i.productId.toString(),
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })
    ),
    totalAmount: doc.totalAmount,
    appliedOffer: doc.appliedOffer,
    status: doc.status as OrderDTO["status"],
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function GET() {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const docs = await Order.find().sort({ createdAt: -1 }).lean();
    const orders = docs.map((d) =>
      toDTO({
        _id: d._id as mongoose.Types.ObjectId,
        orderNumber: d.orderNumber,
        customerId: d.customerId,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        customerAddress: d.customerAddress,
        items: d.items.map((i) => ({
          ...i,
          productId: i.productId as mongoose.Types.ObjectId,
        })),
        totalAmount: d.totalAmount,
        appliedOffer: d.appliedOffer,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })
    );
    return NextResponse.json(orders);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { items, customerName, customerPhone, customerAddress } = body as {
      items?: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
    };
    if (!items?.length) {
      return NextResponse.json({ error: "items required" }, { status: 400 });
    }
    const name = String(customerName ?? "").trim();
    const phone = String(customerPhone ?? "").trim();
    const address = String(customerAddress ?? "").trim();
    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: "Name, mobile and address are required" },
        { status: 400 }
      );
    }
    for (const it of items) {
      if (!mongoose.Types.ObjectId.isValid(it.productId)) {
        return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
      }
      if (!Number.isFinite(it.quantity) || it.quantity < 1 || it.quantity > 50) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }
      if (!Number.isFinite(it.price) || it.price < 0) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
    }
    const productIds = items.map((i) => new mongoose.Types.ObjectId(i.productId));
    const productDocs = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(productDocs.map((d) => [d._id.toString(), d]));
    if (productMap.size !== items.length) {
      return NextResponse.json({ error: "Some products are no longer available" }, { status: 400 });
    }
    let totalAmount = 0;
    for (const i of items) {
      const p = productMap.get(i.productId);
      if (!p) continue;
      const variantPrice = (p.variants ?? []).find((v) => v.label === i.name)?.price;
      const allowedPrice = Number.isFinite(variantPrice) ? Number(variantPrice) : Number(p.price);
      if (i.price !== allowedPrice) {
        return NextResponse.json({ error: "Price changed. Please refresh menu." }, { status: 409 });
      }
      totalAmount += i.price * i.quantity;
    }
    if (totalAmount < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        {
          error: "minimum_order",
          minAmount: MIN_ORDER_AMOUNT,
          message: `Minimum order value is ₹ ${MIN_ORDER_AMOUNT}. Add more items to checkout.`,
        },
        { status: 400 }
      );
    }

    let orderNumber = generateOrderNumber();
    let doc;
    try {
      doc = await Order.create({
        orderNumber,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: items.map((i) => ({
          productId: new mongoose.Types.ObjectId(i.productId),
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount,
        status: "pending",
      });
    } catch (e) {
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code?: number }).code === 11000
      ) {
        orderNumber = generateOrderNumber();
        doc = await Order.create({
          orderNumber,
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          items: items.map((i) => ({
            productId: new mongoose.Types.ObjectId(i.productId),
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          totalAmount,
          status: "pending",
        });
      } else {
        throw e;
      }
    }
    return NextResponse.json(toDTO(doc), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
