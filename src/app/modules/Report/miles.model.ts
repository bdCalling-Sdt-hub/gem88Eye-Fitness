import mongoose, { Schema, Document } from "mongoose";

export interface IMilesReport extends Document {
  staffName: string;
  periodBeginning: Date;
  periodEnding: Date;
  milesDetails: {
    date: Date;
    miles: number;
    mileRate: number;
  }[];
}

const MilesReportSchema = new Schema<IMilesReport>(
  {
    staffName: { type: String, required: true },
    periodBeginning: { type: Date, required: true },
    periodEnding: { type: Date, required: true },
    milesDetails: [
      {
        date: { type: Date, required: true },
        miles: { type: Number, required: true },
        mileRate: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IMilesReport>("MilesReport", MilesReportSchema);
