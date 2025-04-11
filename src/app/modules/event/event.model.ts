import { Schema, model, Document } from 'mongoose';

interface IEvent extends Document {
  name: string;
  location: string;
  startTime: string;
  duration: number; 
  workType: 'online' | 'offline';  // Work type (default: 'offline')
  frequency: 'Once' | 'Bi-Weekly';
  eventDate: Date;
  totalCapacity: number;
  staff: Schema.Types.ObjectId;  // Reference to staff
  status: 'active' | 'inactive'; // Event status (default: 'active')
}

const eventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  startTime: { type: String, required: true },
  duration: { type: Number, required: true },
  workType: { type: String, enum: ['online', 'offline'], default: 'offline' },
  frequency: { type: String, enum: ['Once', 'Bi-Weekly'], required: true },
  eventDate: { type: Date, required: false },
  totalCapacity: { type: Number, required: true },
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Event = model<IEvent>('Event', eventSchema);

export default Event;
