// import mongoose, { Schema, Document } from "mongoose";
// import { USStates } from "../../../enums/location.enum";

// export interface ILocation extends Document {
//   locationName: string;
//   address: string;
//   region: USStates[]; 
//   states: USStates[]; // Array of states from the USStates enum
//   cities: string[]; 
//   locationType?: string; // Optional field
//   hourRate: number;
//   hours: number;
//   date: Date;
//   description: string;
//   mileRate: number;
//   miles: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   mobileNumber: string;
//   workType: "online" | "offline"; 
//   status: "active" | "inactive" ; 
// }

// // Define Mongoose Schema
// // const LocationSchema = new Schema<ILocation>({
// //   locationName: { type: String, required: true },
// //   address: { type: String, required: true },
// //   region: { 
// //     type: [String],  // Array of strings
// //     enum: Object.values(USStates), // Ensure only valid USStates values
// //     required: true 
// //   },
// //   locationType: { type: String, required: false },
// //   hourRate: { type: Number, required: true },
// //   firstName: { type: String, required: true },
// //   lastName: { type: String, required: true },
// //   email: { type: String, required: true },
// //   mobileNumber: { type: String, required: true },
// //   workType: { type: String, enum: ["online", "offline"], required: true },
// // });
// const LocationSchema = new Schema<ILocation>({
//   locationName: { type: String, required: true },
//   address: { type: String, required: true },
//   region: { 
//     type: [String],  
//     enum: Object.values(USStates), 
//     required: true 
//   },
//   states: { 
//     type: [String],  
//     enum: Object.values(USStates),  // States will use the enum
//     required: true 
//   },
//   cities: { 
//     type: [String], // Cities as an array of strings
//     required: false 
//   },
//   locationType: { type: String, required: false },
//   hourRate: { type: Number, required: false },
//   hours: { type: Number, required: false },
//   mileRate: { type: Number, required: false },
//   date: { type: Date, required: false },  
//   miles: { type: Number, required: false },
//   description: { type: String, required: false },
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true },
//   mobileNumber: { type: String, required: true },
//   workType: { type: String, enum: ["online", "offline"], required: true },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
// });

// export const Location = mongoose.model<ILocation>("Location", LocationSchema);


import mongoose, { Schema, Document } from "mongoose";

// Interface for Location
export interface ILocation extends Document {
  locationName: string;
  address: string;
  region: string[];  

  locationType?: string;
  hourRate: number;
  hours: number;
  date: Date;
  description: string;
  mileRate: number;
  miles: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  workType: "online" | "offline";  // Work type can still be limited to "online" or "offline"
  status: "active" | "inactive";  // Status can still be limited to "active" or "inactive"
}

// Define Mongoose Schema without Enums
const LocationSchema = new Schema<ILocation>({
  locationName: { type: String, required: true },
  address: { type: String, required: true },
  region: { 
    type: [String], 
    required: true 
  },

  locationType: { type: String, required: false },
  hourRate: { type: Number, required: false },
  hours: { type: Number, required: false },
  mileRate: { type: Number, required: false },
  date: { type: Date, required: false },  
  miles: { type: Number, required: false },
  description: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  workType: { type: String, enum: ["online", "offline"], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

export const Location = mongoose.model<ILocation>("Location", LocationSchema);
