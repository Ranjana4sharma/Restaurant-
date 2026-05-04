import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type AdminDoc = InferSchemaType<typeof adminSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Admin";

export const Admin: Model<AdminDoc> =
  mongoose.models[modelName] ??
  mongoose.model<AdminDoc>(modelName, adminSchema);
