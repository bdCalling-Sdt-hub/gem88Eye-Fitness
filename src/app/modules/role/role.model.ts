import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  displayName: string;
  email: string;
  resetPasswordOTP: string;
  resetPasswordExpires: Date;
  role: string;
  image?: string; // Optional field for image
  createdAt?: Date; // Add createdAt property
  accessControls: string[];
  password?: string;
}

const RoleSchema = new Schema<IRole>(
  {
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resetPasswordOTP: { type: String, default: null }, 
    resetPasswordExpires: { type: Date, default: null },
    role: {
      type: String,
      enum: [
        "Chief Financial Officer",
        "Chief Operating Officer",
        "Chief Executive Officer",
        "Training Supervisor",
        "Sales Director",
      ],
      required: true,
    },
    image: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    accessControls: { type: [String], required: true },
    password: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", RoleSchema);
