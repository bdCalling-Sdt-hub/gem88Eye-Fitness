import mongoose, { Document, Schema } from 'mongoose';

interface IClient extends Document {
  name: string;
  client_email: string;
  address: string;
  gender: string;
  phone: string;
  active: boolean;
  createdAt: Date;
}

const clientSchema: Schema = new Schema({
  name: { type: String, required: true },
  client_email: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Client = mongoose.model<IClient>('Client', clientSchema);

export default Client;
