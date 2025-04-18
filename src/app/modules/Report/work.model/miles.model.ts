import mongoose, { Schema, Document } from 'mongoose';

interface IMilesDetails extends Document {
  milesDetails: {
    date: Date;
    miles: number;
    mileRate: number;
    
  };
  instructor: mongoose.Types.ObjectId;
  weekNumber: number;  
}
const MilesDetailsSchema = new Schema<IMilesDetails>({
  milesDetails: {
    date: { type: Date, required: false },
    miles: { type: Number, required: true },
    mileRate: { type: Number, required: true },
  },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'InstructorDetails', required: true },
  weekNumber: { type: Number, required: true },  // Week number (1 or 2)
}, { timestamps: true });

export default mongoose.model<IMilesDetails>('MilesDetails', MilesDetailsSchema);
