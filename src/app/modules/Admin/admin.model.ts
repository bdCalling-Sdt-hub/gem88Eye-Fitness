import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  businessName: string;
  address: string;
  email: string;
  password: string;
  image?: string;
  role: string; Default: "admin"
  resetPasswordOTP: string; 
  resetPasswordExpires: Date;
  createdAt?: Date; 
  updatedAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    businessName: { type: String, required: false },
    address: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: null },
    role: { type: String, default: "admin" },
    resetPasswordOTP: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", AdminSchema);
