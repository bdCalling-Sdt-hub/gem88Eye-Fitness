"use strict";
// import mongoose, { Schema, Document } from "mongoose";
// import { USStates } from "../../../enums/location.enum";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
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
const mongoose_1 = __importStar(require("mongoose"));
// Define Mongoose Schema without Enums
const LocationSchema = new mongoose_1.Schema({
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
exports.Location = mongoose_1.default.model("Location", LocationSchema);
