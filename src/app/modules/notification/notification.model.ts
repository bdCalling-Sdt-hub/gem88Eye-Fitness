// import mongoose, { Schema, Document } from 'mongoose';

// export interface INotification extends Document {
//   userId: mongoose.Types.ObjectId;
//   message: string;
//   scheduledTime: Date;
//   type: string;
// }

// const NotificationSchema = new Schema<INotification>({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },  // User who is receiving the notification
//   message: { type: String, required: true },
//   scheduledTime: { type: Date, required: true },
//   type: { type: String, required: true },  // Type of notification (Class, Appointment, etc.)
// }, { timestamps: true });

// export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  userModel: 'Admin' | 'Staff' | 'Lead' | 'Client';
  message: string;
  scheduledTime: Date;
  type: 'Appointment' | 'Class';
  isRead: boolean;
  isSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      refPath: 'userModel' 
    },
    userModel: {
      type: String,
      required: true,
      enum: ['Admin', 'Staff', 'Lead', 'Client']
    },
    message: { 
      type: String, 
      required: true 
    },
    scheduledTime: { 
      type: Date, 
      required: true 
    },
    type: { 
      type: String, 
      required: true, 
      enum: ['Appointment', 'Class'] 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    isSent: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);