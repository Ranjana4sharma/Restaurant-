import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const customerSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true, unique: true },
    address: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    birthDate: { type: String },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export type CustomerDoc = InferSchemaType<typeof customerSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Customer";

export const Customer: Model<CustomerDoc> =
  mongoose.models[modelName] ?? mongoose.model<CustomerDoc>(modelName, customerSchema);
