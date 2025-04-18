import mongoose, { Document, Schema } from 'mongoose';

interface IAppointment extends Document {
  contact: mongoose.Types.ObjectId;
  service: string;
  staff: mongoose.Types.ObjectId;   
  lead: mongoose.Types.ObjectId;    
  location: mongoose.Types.ObjectId; 
  date: string;
  time: string;
  status?: string;
}

const appointmentSchema = new Schema<IAppointment>({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  service: { type: String, required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: false },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['completed','upcoming'], default: 'upcoming' },
});

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
