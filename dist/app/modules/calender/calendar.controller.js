"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allCalendar = exports.getFilteredData = exports.getAllAppointments = exports.bookAppointment = void 0;
const appoinment_model_1 = __importDefault(require("../contact/appoinment.model"));
const client_model_1 = __importDefault(require("../contact/client.model"));
const staff_model_1 = __importDefault(require("../staff/staff.model"));
const leads_model_1 = __importDefault(require("../contact/leads.model"));
const event_model_1 = __importDefault(require("../event/event.model"));
const class_model_1 = __importDefault(require("../class/class.model"));
const bookAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId, service, staffId, leadId, date, time } = req.body;
    if (!clientId || !service || !staffId || !leadId || !date || !time) {
        res.status(400).json({ success: false, message: 'All fields are required!' });
        return;
    }
    try {
        const client = yield client_model_1.default.findById(clientId);
        const staff = yield staff_model_1.default.findById(staffId);
        const lead = yield leads_model_1.default.findById(leadId);
        if (!client) {
            res.status(404).json({ success: false, message: 'Client not found' });
            return;
        }
        if (!staff) {
            res.status(404).json({ success: false, message: 'Staff not found' });
            return;
        }
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found' });
            return;
        }
        const newAppointment = new appoinment_model_1.default({
            contact: client._id,
            service,
            staff: staff._id,
            lead: lead._id,
            class: lead._id,
            date,
            time,
        });
        yield newAppointment.save();
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully!',
            data: newAppointment
        });
    }
    catch (err) {
        console.error('Error during appointment booking:', err);
        next(err);
    }
});
exports.bookAppointment = bookAppointment;
const getAllAppointments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield appoinment_model_1.default.find()
            .populate('contact')
            .populate('staff')
            .populate('lead');
        if (appointments.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No appointments found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Appointments fetched successfully',
            data: appointments
        });
    }
    catch (err) {
        console.error('Error fetching appointments:', err);
        next(err);
    }
});
exports.getAllAppointments = getAllAppointments;
const getFilteredData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, staffId, locationName, className, service, date, startDate, endDate } = req.query;
        const filter = {};
        if (staffId) {
            filter.staff = staffId;
        }
        if (locationName) {
            filter.locationName = locationName;
        }
        if (className) {
            filter.name = className;
        }
        if (service) {
            filter.service = service;
        }
        if (date) {
            const eventDate = new Date(date);
            if (isNaN(eventDate.getTime())) {
                res.status(400).json({ message: "Invalid date format" });
                return;
            }
            filter.eventDate = eventDate;
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                res.status(400).json({ message: "Invalid start or end date format" });
                return;
            }
            filter.eventDate = { $gte: start, $lte: end };
        }
        if (type) {
            let result;
            if (type === 'event') {
                result = yield event_model_1.default.find(filter).populate('staff');
            }
            else if (type === 'appointment') {
                result = yield appoinment_model_1.default.find(filter).populate('staff contact lead');
            }
            else if (type === 'class') {
                result = yield class_model_1.default.find(filter)
                    .populate('staff')
                    .populate('location')
                    .populate('lead');
            }
            else {
                res.status(400).json({ message: "Invalid type specified. Choose between 'event', 'appointment', or 'class'" });
                return;
            }
            res.status(200).json({
                success: true,
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} data fetched successfully.`,
                data: result
            });
            return;
        }
        const events = yield event_model_1.default.find(filter).populate('staff');
        const appointments = yield appoinment_model_1.default.find(filter).populate('staff contact lead');
        const classes = yield class_model_1.default.find(filter)
            .populate('staff')
            .populate('location')
            .populate('lead');
        const result = {
            events,
            appointments,
            classes
        };
        res.status(200).json({
            success: true,
            message: 'Filtered data fetched successfully.',
            data: result
        });
    }
    catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: 'Error fetching filtered data', error: error });
    }
});
exports.getFilteredData = getFilteredData;
const allCalendar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, staffId, locationName, className, service, date, startDate, endDate } = req.query;
        const filter = {};
        if (staffId) {
            filter.staff = staffId;
        }
        if (locationName) {
            filter.locationName = locationName;
        }
        if (className) {
            filter.name = className;
        }
        if (service) {
            filter.service = service;
        }
        if (date) {
            const eventDate = new Date(date);
            if (isNaN(eventDate.getTime())) {
                res.status(400).json({ message: "Invalid date format" });
                return;
            }
            filter.eventDate = eventDate;
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                res.status(400).json({ message: "Invalid start or end date format" });
                return;
            }
            filter.eventDate = { $gte: start, $lte: end };
        }
        let result = [];
        if (type) {
            if (type === 'event') {
                result = yield event_model_1.default.find(filter).populate('staff');
            }
            else if (type === 'appointment') {
                result = yield appoinment_model_1.default.find(filter).populate('staff contact lead');
            }
            else if (type === 'class') {
                result = yield class_model_1.default.find(filter)
                    .populate('staff')
                    .populate('location')
                    .populate('lead');
            }
            else {
                res.status(400).json({ message: "Invalid type specified. Choose between 'event', 'appointment', or 'class'" });
                return;
            }
        }
        else {
            const events = yield event_model_1.default.find(filter).populate('staff');
            const appointments = yield appoinment_model_1.default.find(filter).populate('staff contact lead');
            const classes = yield class_model_1.default.find(filter)
                .populate('staff')
                .populate('location')
                .populate('lead');
            result = [...events, ...appointments, ...classes];
        }
        res.status(200).json({
            success: true,
            message: 'Filtered data fetched successfully.',
            data: result
        });
    }
    catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: 'Error fetching filtered data', error: error });
    }
});
exports.allCalendar = allCalendar;
