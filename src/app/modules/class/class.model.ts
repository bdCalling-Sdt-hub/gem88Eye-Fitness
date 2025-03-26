import { Schema, model, Document } from 'mongoose';

interface IClass extends Document {
  name: string;
  description: string;
  location: string;
  schedule: {
    date: string;
    startTime: string;
    duration: number;  // Duration in minutes
  };
  totalCapacity: number;
  frequency: 'Once' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
}

const classSchema = new Schema<IClass>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  schedule: {
    date: { type: String, required: true },  // The date of the class
    startTime: { type: String, required: true },  // The start time of the class (e.g., '03:00 AM')
    duration: { type: Number, required: true }  // Duration of the class in minutes
  },
  totalCapacity: { type: Number, required: true },
  frequency: { type: String, enum: ['Once', 'Weekly', 'Bi-Weekly', 'Monthly'], required: true }
});

const Class = model<IClass>('Class', classSchema);

export default Class;
