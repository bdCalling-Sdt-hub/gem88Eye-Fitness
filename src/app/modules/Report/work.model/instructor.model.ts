import mongoose, { Schema, Document } from "mongoose";

export interface IInstructor extends Document {
  periodBeginning: Date;
  periodEnding: Date;
  instructorName: mongoose.Schema.Types.ObjectId;  
}

const InstructorDeatils = new Schema<IInstructor>(
  {
    periodBeginning: { type: Date, required: true },
    periodEnding: { type: Date, required: true },
    instructorName: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, 
  },
  { timestamps: true }
);

export default mongoose.model<IInstructor>("Instructor", InstructorDeatils);
