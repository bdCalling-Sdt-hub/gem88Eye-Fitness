import mongoose, { Schema } from "mongoose";
import { IStaff } from "../staff/staff.model";

export interface IPaymentReport extends Document {
    staff: mongoose.Types.ObjectId | IStaff; 
    staffName: string;
    periodBeginning: Date;
    periodEnding: Date;

  }
  
  const PaymentReportSchema = new Schema<IPaymentReport>(
    {
      staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
      staffName: { type: String, required: true },
      periodBeginning: { type: Date, required: true },
      periodEnding: { type: Date, required: true },
   },
    { timestamps: true }
  );
  
  export default mongoose.model<IPaymentReport>("PaymentReport", PaymentReportSchema);
  