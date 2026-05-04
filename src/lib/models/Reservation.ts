import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const reservationSchema = new Schema(
  {
    trackId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1, max: 20, default: 2 },
    reservationDate: { type: String, required: true, trim: true },
    reservationTime: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },
    adminNote: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export type ReservationDoc = InferSchemaType<typeof reservationSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Reservation";

export const Reservation: Model<ReservationDoc> =
  mongoose.models[modelName] ??
  mongoose.model<ReservationDoc>(modelName, reservationSchema);
