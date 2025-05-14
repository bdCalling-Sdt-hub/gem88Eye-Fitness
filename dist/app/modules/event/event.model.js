"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    name: {},
    location: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Location', required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true },
    workType: { type: String, enum: ['online', 'offline'], default: 'offline' },
    frequency: { type: String, enum: ['Once', 'Bi-Weekly'], required: true },
    eventDate: { type: Date, required: false },
    totalCapacity: { type: Number, required: true },
    staff: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Staff', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
const Event = (0, mongoose_1.model)('Event', eventSchema);
exports.default = Event;
