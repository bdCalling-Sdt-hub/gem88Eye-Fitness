import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the lead document (optional, but recommended)
interface ILead extends Document {
  lead_name: string;
  lead_email: string;
  address: string;
  gender: string;
  phone: string;
  active: boolean;
  lead: mongoose.Schema.Types.ObjectId; 
  client_email: string;
  staff: mongoose.Schema.Types.ObjectId; 
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
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: false },
  client_email: { type: String, required: false },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false },
  createdAt: { type: Date, default: Date.now },
});

// Export the model as a module
const Lead = mongoose.model<ILead>('Lead', leadSchema);

export default Lead;
