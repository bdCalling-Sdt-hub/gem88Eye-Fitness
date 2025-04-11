// import mongoose, { Schema, Document } from "mongoose";

// export interface IRole extends Document {
//   name: string;
//   businessName: string;
//   address: string;
//   email: string;
//   resetPasswordOTP: string;
//   resetPasswordExpires: Date;
//   role: string;
//   image?: string; // Optional field for image
//   createdAt?: Date; // Add createdAt property
//   accessControls: string[];
//   password?: string;
// }

// const RoleSchema = new Schema<IRole>(
//   {
//     name: { type: String, required: true },
//     businessName: { type: String, required: false },
//     address: { type: String, required: false },
//     email: { type: String, required: true, unique: true },
//     resetPasswordOTP: { type: String, default: null }, 
//     resetPasswordExpires: { type: Date, default: null },
//     role: {
//       type: String,
//       enum: [
//         "Chief Financial Officer",
//         "Chief Operating Officer",
//         "Chief Executive Officer",
//         "Training Supervisor",
//         "Sales Director",
//       ],
//       required: true,
//     },
//     image: { type: String, default: null },
//     createdAt: { type: Date, default: Date.now },
//     accessControls: { type: [String], required: true },
//     password: { type: String, required: false },
//   },
//   { timestamps: true }
// );

// export default mongoose.model<IRole>("Role", RoleSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  businessName: string;
  address: string;
  email: string;
  resetPasswordOTP: string;
  resetPasswordExpires: Date;
  role: string;
  image?: string; // Optional field for image
  createdAt?: Date; // Add createdAt property
  accessControls: string[]; // Array of strings to store page names
  password?: string;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    businessName: { type: String, required: false },
    address: { type: String, required: false },
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
    accessControls: { 
      type: [String], 
      required: true,
      default: [
        "calendar", "services", "invoice", "contact", 
        "reports", "payroll-reporting", "settings"
      ] // Pre-store all pages by default
    },
    password: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", RoleSchema);
