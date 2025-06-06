
// import { Schema, model, Document } from 'mongoose';
// import ILead from '../contact/leads.model';   // Assuming the Lead interface is imported
// import { IStaff } from '../staff/staff.model'; // Assuming the Staff interface is imported

// interface IClass extends Document {
//   name: string;
//   location: string;
//   schedule: [
//     {
//       date: string;  // The date of the class
//       sessions: [
//         {
//           startTime: string;  // The start time of the session (e.g., '03:00 AM')
//           duration: number;   // Duration of the session in minutes
//         }
//       ];  // Multiple sessions for a single date
//     }
//   ];
//   totalCapacity: number;
//   frequency: 'Once' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
//   workType: 'online' | 'offline';  
//   status: 'active' | 'inactive';
//   lead: Schema.Types.ObjectId; 
//   staff: Schema.Types.ObjectId; 
// }

// const classSchema = new Schema<IClass>({
//   name: { type: String, required: true },
//   location: { type: String, required: true },
//   schedule: [
//     {
//       date: { type: String, required: true },  // The date of the class
//       sessions: [
//         {
//           startTime: { type: String, required: true },  // Start time of the session (e.g., '03:00 AM')
//           duration: { type: Number, required: true }  // Duration of the session in minutes
//         }
//       ]
//     }
//   ],
//   totalCapacity: { type: Number, required: true },
//   frequency: { type: String, enum: ['Once', 'Weekly', 'Bi-Weekly', 'Monthly'], required: true },
//   workType: { type: String, enum: ['online', 'offline'], required: true },  
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//   lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },  
//   staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }
// }, { timestamps: true });

// const Class = model<IClass>('Class', classSchema);

// export default Class;



import { Schema, model, Document } from 'mongoose';
import ILead from '../contact/leads.model'; 
import { IStaff } from '../staff/staff.model';
import { ILocation } from '../Admin/location.model'; 

interface IClass extends Document {
  name: string;
  location: Schema.Types.ObjectId;
  schedule: [
    {
      date: string; 
      sessions: [
        {
          startTime: string; 
          duration: number;  
        }
      ];  
    }
  ];
  totalCapacity: number;
  frequency: 'Once' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
  workType: 'online' | 'offline';  
  status: 'active' | 'inactive';
  lead: Schema.Types.ObjectId; 
  staff: Schema.Types.ObjectId; 
}

const classSchema = new Schema<IClass>({
  name: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  schedule: [
    {
      date: { type: String, required: true }, 
      sessions: [
        {
          startTime: { type: String, required: true }, 
          duration: { type: Number, required: true } 
        }
      ]
    }
  ],
  totalCapacity: { type: Number, required: true },
  frequency: { type: String, enum: ['Once', 'Weekly', 'Bi-Weekly', 'Monthly'], required: true },
  workType: { type: String, enum: ['online', 'offline'], required: true },  
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },  
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }
}, { timestamps: true });
// const classSchema = new Schema<IClass>({
//   name: { type: String, required: true },
//   location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
//   schedule: [
//     {
//       date: { type: String, required: true }, 
//       sessions: [
//         {
//           startTime: { type: String, required: true }, 
//           duration: { type: Number, required: true } 
//         }
//       ]
//     }
//   ],
//   totalCapacity: { type: Number, required: true },
//   frequency: { type: String, enum: ['Once', 'Weekly', 'Bi-Weekly', 'Monthly'], required: true },
//   workType: { type: String, enum: ['online', 'offline'], required: true },  
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//   lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },  
//   staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }
// }, { timestamps: true });


const Class = model<IClass>('Class', classSchema);

export default Class;
