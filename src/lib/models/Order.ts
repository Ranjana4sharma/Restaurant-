import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, sparse: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, trim: true, default: "" },
    customerPhone: { type: String, trim: true, default: "" },
    customerAddress: { type: String, trim: true, default: "" },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    appliedOffer: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Order";

export const Order: Model<OrderDoc> =
  mongoose.models[modelName] ?? mongoose.model<OrderDoc>(modelName, orderSchema);
