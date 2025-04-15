import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffAvailability extends Document {
  staff: mongoose.Schema.Types.ObjectId; // Reference to Staff model
  day: string; 
  date: Date; 
  startTime: string; // Start time (e.g., '09:00')
  endTime: string; // End time (e.g., '17:00')
}

const staffAvailabilitySchema = new Schema<IStaffAvailability>(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    date: { type: Date, required: false },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStaffAvailability>('StaffAvailability', staffAvailabilitySchema);
