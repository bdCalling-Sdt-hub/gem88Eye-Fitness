import mongoose, { Document, Schema } from 'mongoose';

interface IInvoice extends Document {
  // invoiceId: string;
  client: string; 
  className: string;
  contactName: string;
  services: string;
  invoiceTotal: number;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceDueDate: Date;
  active: boolean; 
}

const invoiceSchema: Schema = new Schema({
  // invoiceId: { type: String, required: true },
  client: { type: String, required: true }, 
  className: { type: String, required: true },
  contactName: { type: String, required: true },
  services: { type: String, required: true },
  invoiceTotal: { type: Number, required: true },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  invoiceDueDate: { type: Date, required: true },
  active: { type: Boolean, }, 
});

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;