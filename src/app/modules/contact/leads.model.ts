import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the lead document (optional, but recommended)
interface ILead extends Document {
  lead_name: string;
  lead_email: string;
  address: string;
  gender: string;
  phone: string;
  active: boolean;
  createdAt: Date;
}

// Define the schema for the lead model
const leadSchema: Schema = new Schema({
  lead_name: { type: String, required: true },
  lead_email: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the model as a module
const Lead = mongoose.model<ILead>('Lead', leadSchema);

export default Lead;
