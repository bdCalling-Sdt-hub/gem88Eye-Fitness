// import mongoose, { Document, Schema } from 'mongoose';

// interface IInvoice extends Document {
//   // invoiceId: string;
//   client: string; 
//   className: string;
//   contactName: string;
//   services: string;
//   invoiceTotal: number;
//   invoiceNumber: string;
//   invoiceDate: Date;
//   invoiceDueDate: Date;
//   active: boolean; 
// }

// const invoiceSchema: Schema = new Schema({
//   // invoiceId: { type: String, required: true },
//   client: { type: String, required: true }, 
//   className: { type: String, required: true },
//   contactName: { type: String, required: true },
//   services: { type: String, required: true },
//   invoiceTotal: { type: Number, required: true },
//   invoiceNumber: { type: String, required: true },
//   invoiceDate: { type: Date, required: true },
//   invoiceDueDate: { type: Date, required: true },
//   active: { type: Boolean, }, 
// });

// const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

// export default Invoice;
import mongoose, { Document, Schema } from 'mongoose';

interface IInvoice extends Document {
  client: mongoose.Schema.Types.ObjectId;  
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
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },  // ObjectId reference to Client
  className: { type: String, required: true },
  contactName: { type: String, required: true },
  services: { type: String, required: true },
  invoiceTotal: { type: Number, required: true },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  invoiceDueDate: { type: Date, required: true },
  active: { type: Boolean, default: true },  // Assuming default is true if not provided
}, { timestamps: true });

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;
