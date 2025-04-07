import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  name: string;
  documents: string[];
  expiryDate: Date;
  status: string; // Valid or Invalid
  role?: string; // Optional field for role
  image?: string; // Optional field for image
  createdAt?: Date; // Add createdAt property
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    documents: { type: [String], required: true },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["valid", "invalid"],
      default: function () {
        return new Date(this.expiryDate) > new Date() ? "valid" : "invalid";
      },
    },
    role: { type: String, required: false, default: "staff" }, // Default role is "staff"
    image: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>("Staff", StaffSchema);

