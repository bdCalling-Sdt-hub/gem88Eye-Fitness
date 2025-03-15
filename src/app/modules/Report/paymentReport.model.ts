import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentReport extends Document {
  staffName: string;
  periodBeginning: Date;
  periodEnding: Date;
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
    staffName: { type: String, required: true },
    periodBeginning: { type: Date, required: true },
    periodEnding: { type: Date, required: true },
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
