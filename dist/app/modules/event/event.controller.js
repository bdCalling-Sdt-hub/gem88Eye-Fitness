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
exports.getUpcomingAndPastAppointmentsEventsClassesWithFilter = exports.getUpcomingAndPastAppointmentsEventsClasses = exports.deleteEvent = exports.getAllEvents = exports.updateEvent = exports.createEvent = void 0;
const event_model_1 = __importDefault(require("./event.model"));
const appoinment_model_1 = __importDefault(require("../../modules/contact/appoinment.model"));
const location_model_1 = require("../Admin/location.model");
const class_model_1 = __importDefault(require("../class/class.model"));
const moment_1 = __importDefault(require("moment"));
const createEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, startTime, duration, frequency, totalCapacity, workType, staff, status, eventDate, } = req.body;
        if (!name || !location || !startTime || !duration || !frequency || !totalCapacity || !workType || !staff || !eventDate) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        let recurrenceSchedule = [];
        if (frequency === 'Once') {
            if (!eventDate) {
                return res.status(400).json({ message: 'Please provide a date for the "Once" frequency.' });
            }
            const eventDateObj = new Date(eventDate);
            if (isNaN(eventDateObj.getTime())) {
                return res.status(400).json({ message: 'Invalid date format provided for the event.' });
            }
            recurrenceSchedule.push(eventDateObj);
        }
        else {
            const initialClassDate = new Date(startTime);
            if (frequency === 'Weekly') {
                for (let i = 0; i < 4; i++) {
                    const newDate = new Date(initialClassDate);
                    newDate.setDate(newDate.getDate() + i * 7);
                    recurrenceSchedule.push(newDate);
                }
            }
            else if (frequency === 'Bi-Weekly') {
                for (let i = 0; i < 4; i++) {
                    const newDate = new Date(initialClassDate);
                    newDate.setDate(newDate.getDate() + i * 14);
                    recurrenceSchedule.push(newDate);
                }
            }
            else if (frequency === 'Monthly') {
                for (let i = 0; i < 4; i++) {
                    const newDate = new Date(initialClassDate);
                    newDate.setMonth(newDate.getMonth() + i);
                    recurrenceSchedule.push(newDate);
                }
            }
        }
        const newEvent = new event_model_1.default({
            name,
            location,
            startTime,
            duration,
            frequency,
            eventDate,
            totalCapacity,
            workType,
            staff,
            status: status || 'active',
            recurrenceSchedule,
        });
        yield newEvent.populate('staff');
        yield newEvent.populate('location');
        yield newEvent.save();
        return res.status(201).json({
            success: true,
            message: 'Event created successfully!',
            data: newEvent,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createEvent = createEvent;
const updateEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    const { name, location, startTime, duration, frequency, totalCapacity, staff, status } = req.body;
    try {
        const event = yield event_model_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        event.name = name || event.name;
        event.location = location || event.location;
        event.startTime = startTime || event.startTime;
        event.duration = duration || event.duration;
        event.frequency = frequency || event.frequency;
        event.totalCapacity = totalCapacity || event.totalCapacity;
        event.staff = staff || event.staff;
        event.status = status || event.status;
        yield event.save();
        return res.status(200).json({
            success: true,
            message: 'Event updated successfully!',
            data: event
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateEvent = updateEvent;
const getAllEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield event_model_1.default.find().populate('staff');
        if (!events || events.length === 0) {
            return res.status(404).json({ message: 'No events found' });
        }
        const newEvent = yield event_model_1.default.findById(events[0]._id).populate('staff')
            .populate('location');
        return res.status(200).json({
            success: true,
            message: 'Events fetched successfully!',
            data: events,
            newEvent,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllEvents = getAllEvents;
const deleteEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    try {
        const event = yield event_model_1.default.findByIdAndDelete(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully!',
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteEvent = deleteEvent;
const getDateRange = (range) => {
    const now = (0, moment_1.default)();
    switch (range) {
        case 'today':
            return {
                startDate: now.startOf('day').toDate(),
                endDate: now.endOf('day').toDate(),
            };
        case 'thisWeek':
            return {
                startDate: now.startOf('week').toDate(),
                endDate: now.endOf('week').toDate(),
            };
        case 'thisMonth':
            return {
                startDate: now.startOf('month').toDate(),
                endDate: now.endOf('month').toDate(),
            };
        default:
            return { startDate: null, endDate: null };
    }
};
const getUpcomingAndPastAppointmentsEventsClasses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location, dateRange } = req.query;
        const { startDate, endDate } = getDateRange(dateRange);
        const now = new Date();
        let appointmentLocationFilter = {};
        let eventLocationFilter = {};
        let classLocationFilter = {};
        if (location) {
            const locationDoc = yield location_model_1.Location.findOne({
                locationName: new RegExp(String(location), 'i')
            }).select('_id locationName');
            if (locationDoc) {
                appointmentLocationFilter = { location: locationDoc._id };
                classLocationFilter = { location: locationDoc._id };
                eventLocationFilter = {
                    locationName: new RegExp(String(location), 'i')
                };
            }
            else {
                const eventWithLocation = yield event_model_1.default.findOne({
                    locationName: new RegExp(String(location), 'i')
                });
                if (eventWithLocation) {
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: 'Location not found in the database.',
                    });
                    return;
                }
            }
        }
        const allAppointments = yield appoinment_model_1.default.find(appointmentLocationFilter)
            .populate('contact')
            .populate('staff')
            .populate('lead')
            .populate('location');
        const upcomingAppointments = allAppointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            if (appointmentDate < now)
                return false;
            if (startDate && endDate) {
                return appointmentDate >= startDate && appointmentDate <= endDate;
            }
            return true;
        });
        const pastAppointments = allAppointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            if (appointmentDate >= now)
                return false;
            if (startDate && endDate) {
                return appointmentDate >= startDate && appointmentDate <= endDate;
            }
            return true;
        });
        const getEventQuery = (isPast) => {
            const query = Object.assign({}, eventLocationFilter);
            if (isPast) {
                query.eventDate = { $lt: now };
            }
            else {
                query.eventDate = { $gte: now };
            }
            if (startDate && endDate) {
                query.eventDate = Object.assign(Object.assign({}, (isPast ? { $lt: now } : { $gte: now })), { $gte: startDate, $lte: endDate });
            }
            return query;
        };
        const upcomingEvents = yield event_model_1.default.find(getEventQuery(false))
            .populate('staff')
            .populate('location');
        const pastEvents = yield event_model_1.default.find(getEventQuery(true))
            .populate('staff')
            .populate('location');
        const allClasses = yield class_model_1.default.find(classLocationFilter)
            .populate('staff')
            .populate('lead')
            .populate('location');
        const upcomingClasses = allClasses.filter(classItem => {
            return classItem.status === 'active' && classItem.schedule.some(session => {
                const classDate = new Date(session.date);
                if (classDate < now)
                    return false;
                if (startDate && endDate) {
                    return classDate >= startDate && classDate <= endDate;
                }
                return true;
            });
        });
        const pastClasses = allClasses.filter(classItem => {
            return classItem.status === 'active' && classItem.schedule.some(session => {
                const classDate = new Date(session.date);
                if (classDate >= now)
                    return false;
                if (startDate && endDate) {
                    return classDate >= startDate && classDate <= endDate;
                }
                return true;
            });
        });
        res.status(200).json({
            success: true,
            message: 'Upcoming and past appointments, events, and classes retrieved successfully!',
            data: {
                upcomingAppointments,
                pastAppointments,
                upcomingEvents,
                pastEvents,
                upcomingClasses,
                pastClasses,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUpcomingAndPastAppointmentsEventsClasses = getUpcomingAndPastAppointmentsEventsClasses;
const getUpcomingAndPastAppointmentsEventsClassesWithFilter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location, dateRange, staffId } = req.query;
        const { startDate, endDate } = getDateRange(dateRange);
        const now = new Date();
        const locationFilter = location ? { location } : {};
        const staffFilter = staffId ? { staff: staffId } : {};
        const allAppointments = yield appoinment_model_1.default.find(Object.assign(Object.assign({}, locationFilter), staffFilter))
            .populate('contact')
            .populate('staff')
            .populate('lead')
            .populate('location');
        const upcomingAppointments = allAppointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            if (appointmentDate < now)
                return false;
            if (startDate && endDate) {
                return appointmentDate >= startDate && appointmentDate <= endDate;
            }
            return true;
        });
        const pastAppointments = allAppointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            if (appointmentDate >= now)
                return false;
            if (startDate && endDate) {
                return appointmentDate >= startDate && appointmentDate <= endDate;
            }
            return true;
        });
        const getEventQuery = (isPast) => {
            const query = Object.assign(Object.assign({}, locationFilter), staffFilter);
            if (isPast) {
                query.eventDate = { $lt: now };
            }
            else {
                query.eventDate = { $gte: now };
            }
            if (startDate && endDate) {
                query.eventDate = Object.assign(Object.assign({}, (isPast ? { $lt: now } : { $gte: now })), { $gte: startDate, $lte: endDate });
            }
            return query;
        };
        const upcomingEvents = yield event_model_1.default.find(getEventQuery(false))
            .populate('staff');
        const pastEvents = yield event_model_1.default.find(getEventQuery(true))
            .populate('staff');
        const allClasses = yield class_model_1.default.find(Object.assign(Object.assign({}, locationFilter), staffFilter))
            .populate('staff')
            .populate('lead');
        const upcomingClasses = allClasses.filter(classItem => {
            return classItem.schedule.some(session => {
                const classDate = new Date(session.date);
                if (classDate < now)
                    return false;
                if (startDate && endDate) {
                    return classDate >= startDate && classDate <= endDate;
                }
                return true;
            });
        });
        const pastClasses = allClasses.filter(classItem => {
            return classItem.schedule.some(session => {
                const classDate = new Date(session.date);
                if (classDate >= now)
                    return false;
                if (startDate && endDate) {
                    return classDate >= startDate && classDate <= endDate;
                }
                return true;
            });
        });
        res.status(200).json({
            success: true,
            message: 'Upcoming and past appointments, events, and classes retrieved successfully!',
            data: {
                upcomingAppointments,
                pastAppointments,
                upcomingEvents,
                pastEvents,
                upcomingClasses,
                pastClasses,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUpcomingAndPastAppointmentsEventsClassesWithFilter = getUpcomingAndPastAppointmentsEventsClassesWithFilter;
