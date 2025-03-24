import mongoose, { Document, Schema } from 'mongoose';

interface IAppointment extends Document {
  contact: mongoose.Types.ObjectId; // Client reference
  service: string;
  staff: mongoose.Types.ObjectId;   // Staff reference
  lead: mongoose.Types.ObjectId;    // Lead reference
  date: string;
  time: string;
}

const appointmentSchema = new Schema<IAppointment>({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  service: { type: String, required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
