import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  name: string;
  businessName?: string; 
  address?: string;
  documents: string;
  expiryDate: Date;
  status: string; 
  role?: string; 
  image?: string; 
  createdAt?: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    businessName: { type: String, required: false },
    address: { type: String, required: false },
    documents: { type: String, required: true }, 
    expiryDate: { type: Date, required: true },
    
    status: {
      type: String,
      enum: ["valid", "invalid"],
      default: function () {
        return new Date(this.expiryDate) > new Date() ? "valid" : "invalid";
      },
    },
  
    role: { type: String, required: false, default: "staff" },
    image: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>("Staff", StaffSchema);

