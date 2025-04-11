// import { Schema, model, Document } from 'mongoose';
// import  ILead  from '../contact/leads.model';   // Import the Lead interface
// import { IStaff } from '../staff/staff.model'; // Import the Staff interface

// interface IClass extends Document {
//   name: string;
//   description: string;
//   location: string;
//   schedule: {
//     date: string;
//     startTime: string;
//     duration: number;  // Duration in minutes
//   };
//   totalCapacity: number;
//   frequency: 'Once' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
//   workType: 'online' | 'offline';
//   lead: Schema.Types.ObjectId; 
//   staff: Schema.Types.ObjectId;
// }

// const classSchema = new Schema<IClass>({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   location: { type: String, required: true },
//   schedule: {
//     date: { type: String, required: true },  // The date of the class
//     startTime: { type: String, required: true },  // The start time of the class (e.g., '03:00 AM')
//     duration: { type: Number, required: true }  // Duration of the class in minutes
//   },
//   totalCapacity: { type: Number, required: true },
//   frequency: { type: String, enum: ['Once', 'Weekly', 'Bi-Weekly', 'Monthly'], required: true },
//   workType: { type: String, enum: ['online', 'offline'], required: true },
//   lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },   // Reference to Lead model
//   staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }  // Reference to Staff model
// });

// const Class = model<IClass>('Class', classSchema);

// export default Class;


import { Schema, model, Document } from 'mongoose';
import  ILead  from '../contact/leads.model';   // Assuming the Lead interface is imported
import { IStaff } from '../staff/staff.model'; // Assuming the Staff interface is imported

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
  workType: 'online' | 'offline';  
  status: 'active' | 'inactive';
  lead: Schema.Types.ObjectId; 
  staff: Schema.Types.ObjectId; 
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
  frequency: { type: String, enum: ['Once', 'Weekly', 'Bi-Weekly', 'Monthly'], required: true },
  workType: { type: String, enum: ['online', 'offline'], required: true },  
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },  
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }  
});

const Class = model<IClass>('Class', classSchema);

export default Class;
