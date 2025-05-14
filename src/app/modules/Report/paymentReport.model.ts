import mongoose, { Schema, Document } from "mongoose";
import { IStaff } from "../staff/staff.model";

export interface IPaymentReport extends Document {
  staff: mongoose.Types.ObjectId | IStaff; 
  staffName: string;
  periodBeginning: Date;
  periodEnding: Date;
  date: Date;
  workDetails: {
    date: Date;
    workDescription: string;
    hours: number;
    hourRate: number;
    workType: "online" | "offline";
  }[];
}

const PaymentReportSchema = new Schema<IPaymentReport>(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    staffName: { type: String, required: true },
    periodBeginning: { type: Date, required: true },
    periodEnding: { type: Date, required: true },
    date: { type: Date, required: false },
    workDetails: [
      {
        date: { type: Date, required: true },
        workDescription: { type: String, required: true },
        hours: { type: Number, required: true },
        hourRate: { type: Number, required: true },
        workType: { type: String, enum: ["online", "offline"], required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentReport>("PaymentReport", PaymentReportSchema);
