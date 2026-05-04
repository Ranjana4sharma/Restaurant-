import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ReviewDoc = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Review";

export const Review: Model<ReviewDoc> =
  mongoose.models[modelName] ??
  mongoose.model<ReviewDoc>(modelName, reviewSchema);
