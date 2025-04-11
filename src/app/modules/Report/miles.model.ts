// import mongoose, { Schema, Document } from "mongoose";

// export interface IMilesReport extends Document {
//   staffName: string;
//   periodBeginning: Date;
//   periodEnding: Date;
//   milesDetails: {
//     date: Date;
//     miles: number;
//     mileRate: number;
//   }[];
// }

// const MilesReportSchema = new Schema<IMilesReport>(
//   {
//     staffName: { type: String, required: true },
//     periodBeginning: { type: Date, required: true },
//     periodEnding: { type: Date, required: true },
//     milesDetails: [
//       {
//         date: { type: Date, required: true },
//         miles: { type: Number, required: true },
//         mileRate: { type: Number, required: true },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// export default mongoose.model<IMilesReport>("MilesReport", MilesReportSchema);

import mongoose, { Schema, Document } from "mongoose";
import { IStaff } from "../staff/staff.model";


export interface IMilesReport extends Document {
  staff: mongoose.Types.ObjectId | IStaff; 
  lead: mongoose.Types.ObjectId;  
  staffName: string;
  leadName: string;
  periodBeginning: Date;
  periodEnding: Date;
  date: Date;
  milesDetails: {
    date: Date;
    miles: number;
    mileRate: number;
  }[];
}

const MilesReportSchema = new Schema<IMilesReport>(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    staffName: { type: String, required: true },
    leadName: { type: String, required: true },
    periodBeginning: { type: Date, required: true },
    periodEnding: { type: Date, required: true },
    date: { type: Date, required: false},
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
