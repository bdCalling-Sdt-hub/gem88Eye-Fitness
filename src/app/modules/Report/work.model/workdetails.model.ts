import mongoose, { Schema, Document } from "mongoose";

export interface IWorkDetails extends Document {
  instructor: mongoose.Schema.Types.ObjectId;  
  workDetails: {
    date: Date;
    workDescription: string;
    hours: number;
    hourRate: number;
    workType: string;
  };
}

const WorkDetailsSchema = new Schema<IWorkDetails>(
  {
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true }, 
    workDetails:{
        date: { type: Date, required: true , unique: true},
        workDescription: { type: String, required: true },
        hours: { type: Number, required: true },
        hourRate: { type: Number, required: true },
        workType: { type: String, enum: ["online", "offline"], required: true },
      },
    
  },
  { timestamps: true }
);

const WorkDetails = mongoose.models.WorkDetails || mongoose.model<IWorkDetails>("WorkDetails", WorkDetailsSchema);

export default WorkDetails;
