// models/Appointment.ts
import { Schema, model, Document } from 'mongoose';

interface IAppointment extends Document {
  contact: Schema.Types.ObjectId;  // Reference to Client
  service: string;
  staff: Schema.Types.ObjectId;    // Reference to Staff
  lead: Schema.Types.ObjectId;     // Reference to Lead
  date: string;
  time: string;
}

const appointmentSchema = new Schema<IAppointment>({
  contact: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  service: { type: String, required: true },
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const Appointment = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
