import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { Offer } from "@/lib/models/Offer";
import { generateOrderNumber } from "@/lib/order-number";
import { jsonWithCustomerSession, getCustomerSession } from "@/lib/customer-auth";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { items, customerName, customerEmail, customerPhone, customerAddress, password, offerId } = body;
    const identityEmail = (customerEmail || customerPhone || "").trim();

    let customer = null;
    const session = await getCustomerSession();

    if (session) {
      customer = await Customer.findById(session.customerId);
    }

    if (!customer && session?.email) {
      customer = await Customer.findOne({ $or: [{ email: session.email }, { phone: session.email }] });
    }

    if (!customer) {
      if (!items?.length || !customerName || !identityEmail || !customerAddress || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
      }

      customer = await Customer.findOne({ $or: [{ email: identityEmail }, { phone: identityEmail }] });
      if (customer) {
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Incorrect password for this account" }, { status: 401 });
        }
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        customer = await Customer.create({
          name: customerName,
          phone: identityEmail,
          email: identityEmail,
          address: customerAddress,
          password: hashedPassword,
        });
      }
    }

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Order Logic
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return NextResponse.json({ error: `Invalid product ID: ${item.productId}` }, { status: 400 });
      }
    }

    const productIds = items.map((i: any) => new mongoose.Types.ObjectId(i.productId));
    const productDocs = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(productDocs.map((d) => [d._id.toString(), d]));

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const p = productMap.get(item.productId);
      
      let price = Number(item.price) || 0;
      if (p) {
        const variantPrice = (p.variants ?? []).find((v: any) => v.label === item.name)?.price;
        price = Number.isFinite(variantPrice) ? Number(variantPrice) : Number(p.price);
      }
      
      const qty = Math.max(1, Number(item.quantity) || 1);
      subtotal += price * qty;
      orderItems.push({
        productId: new mongoose.Types.ObjectId(item.productId),
        name: item.name,
        quantity: qty,
        price: price,
      });
    }

    if (subtotal <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    let discount = 0;
    let appliedOfferDoc = null;

    // 1. If offerId provided, validate it
    let targetOffer = null;
    if (offerId && mongoose.Types.ObjectId.isValid(offerId)) {
      targetOffer = await Offer.findById(offerId);
    } 
    
    // 2. If no offerId or invalid, check for auto-apply offers
    if (!targetOffer) {
      targetOffer = await Offer.findOne({ 
        isActive: true, 
        isAutoApply: true, 
        minOrderValue: { $lte: subtotal } 
      }).sort({ discountValue: -1 });
    }

    if (targetOffer && targetOffer.title.toLowerCase().includes("welcome")) {
      const pastOrdersCount = await Order.countDocuments({ customerId: customer._id });
      if (pastOrdersCount > 0) {
        if (offerId && targetOffer._id.toString() === offerId.toString()) {
          return NextResponse.json({ error: "Welcome offer is only for first-time users." }, { status: 400 });
        } else {
          targetOffer = null;
        }
      }
    }

    if (targetOffer && targetOffer.isActive && subtotal >= (targetOffer.minOrderValue || 0)) {
      if (targetOffer.discountType === "percentage") {
        discount = (subtotal * targetOffer.discountValue) / 100;
        if (targetOffer.maxDiscount && discount > targetOffer.maxDiscount) {
          discount = targetOffer.maxDiscount;
        }
      } else {
        discount = targetOffer.discountValue;
      }
      appliedOfferDoc = {
        _id: targetOffer._id,
        title: targetOffer.title,
        discountValue: targetOffer.discountValue,
        discountType: targetOffer.discountType,
        discountAmount: discount, // Added this for easy UI display
      };
    }

    const discountTotal = discount;
    const amountBeforeTax = Math.max(0, subtotal - discountTotal);
    const taxAmount = Math.round(amountBeforeTax * 0.05);
    const totalAmount = amountBeforeTax + taxAmount;
    
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      customerName: customerName || customer.name,
      customerPhone: identityEmail || customer.email || customer.phone,
      customerAddress: customerAddress || customer.address,
      items: orderItems,
      subtotal,
      discountAmount: discountTotal,
      taxAmount,
      totalAmount,
      appliedOffer: appliedOfferDoc,
      status: "pending",
    });

    await sendOrderConfirmationEmail((customer.email || customer.phone || identityEmail) as string, {
      orderId: order.orderNumber || "",
      amount: order.totalAmount,
    });

    const response = await jsonWithCustomerSession(
      customer._id.toString(),
      (customer.email || customer.phone || identityEmail) as string
    );
    return NextResponse.json({ 
      ok: true, 
      order: { orderNumber: order.orderNumber } 
    }, { 
      headers: response.headers 
    });
  } catch (e: any) {
    console.error("Checkout Error:", e);
    return NextResponse.json({ error: e.message || "Checkout failed" }, { status: 500 });
  }
}
