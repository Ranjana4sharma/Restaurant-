import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const offerSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, unique: true, sparse: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    badge: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isAutoApply: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type OfferDoc = InferSchemaType<typeof offerSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Offer";

export const Offer: Model<OfferDoc> =
  mongoose.models[modelName] ?? mongoose.model<OfferDoc>(modelName, offerSchema);
