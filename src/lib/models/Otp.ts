import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  type: "signup" | "forgot_password";
  createdAt: Date;
}

const OtpSchema: Schema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["signup", "forgot_password"], required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Expire after 10 minutes
});

export default mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
