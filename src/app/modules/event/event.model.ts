import { Schema, model, Document } from 'mongoose';

interface IEvent extends Document {
  name: string;
  location: Schema.Types.ObjectId;
  startTime: string;
  duration: number; 
  workType: 'online' | 'offline'; 
  frequency: 'Once' | 'Bi-Weekly';
  eventDate: Date;
  totalCapacity: number;
  staff: Schema.Types.ObjectId; 
  status: 'active' | 'inactive'; 
}

const eventSchema = new Schema<IEvent>({
  name: { },
  location: {type: Schema.Types.ObjectId, ref: 'Location', required: true  },
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
