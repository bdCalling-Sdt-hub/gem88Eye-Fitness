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
exports.deleteAppoinment = exports.getAppointmentStats = exports.getAllAppointments = exports.updateAppointment = exports.bookAppointment = void 0;
const appoinment_model_1 = __importDefault(require("./appoinment.model"));
const client_model_1 = __importDefault(require("./client.model"));
const staff_model_1 = __importDefault(require("../staff/staff.model"));
const leads_model_1 = __importDefault(require("./leads.model"));
const notification_model_1 = __importDefault(require("../notification/notification.model"));
const admin_model_1 = __importDefault(require("../Admin/admin.model"));
const moment_1 = __importDefault(require("moment"));
const bookAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { contactName, service, staffId, leadId, date, time } = req.body;
    if (!contactName || !service || !staffId || !leadId || !date || !time) {
        res.status(400).json({ success: false, message: 'All fields are required!' });
        return;
    }
    try {
        const client = yield client_model_1.default.findOne({ name: contactName });
        const staff = yield staff_model_1.default.findById(staffId);
        const lead = yield leads_model_1.default.findById(leadId);
        if (!client || !staff || !lead) {
            res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
            return;
        }
        const appointmentDateTime = new Date(`${date}T${time}`);
        if (isNaN(appointmentDateTime.getTime())) {
            res.status(400).json({ success: false, message: 'Invalid date or time format' });
            return;
        }
        const status = (0, moment_1.default)(appointmentDateTime).isBefore((0, moment_1.default)()) ? 'completed' : 'upcoming';
        const newAppointment = new appoinment_model_1.default({
            contact: client._id,
            service,
            staff: staff._id,
            lead: lead._id,
            date,
            time,
            status,
        });
        yield newAppointment.save();
        createAdminNotifications({
            service: service,
            lead: lead.name || lead._id.toString()
        }, 'Appointment', appointmentDateTime, req.app.get('io'));
        const notificationMessage = `You have a new appointment for ${service}`;
        res.status(201).json({
            success: true,
            message: 'Appointment booked and notifications sent!',
            data: newAppointment,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.bookAppointment = bookAppointment;
const createAdminNotifications = (appointment, type, appointmentDateTime, io) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield admin_model_1.default.find();
        const notificationMessage = `A new appointment has been booked for service: ${appointment.service} with lead: ${appointment.lead}`;
        const notificationDate = new Date();
        const notificationData = admins.map(admin => ({
            userId: admin._id,
            userModel: 'Admin',
            message: notificationMessage,
            scheduledTime: notificationDate,
            type: type,
            isRead: false,
            isSent: false
        }));
        yield notification_model_1.default.insertMany(notificationData);
    }
    catch (err) {
        console.error('Error creating admin notifications:', err);
        throw new Error('Error creating admin notifications');
    }
});
const updateAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentId } = req.params;
    const { contactName, service, staffId, leadId, date, time } = req.body;
    try {
        const appointment = yield appoinment_model_1.default.findById(appointmentId);
        if (!appointment) {
            res.status(404).json({ success: false, message: 'Appointment not found!' });
            return;
        }
        const client = yield client_model_1.default.findOne({ name: contactName });
        const staff = yield staff_model_1.default.findById(staffId);
        const lead = yield leads_model_1.default.findById(leadId);
        if (!client || !staff || !lead) {
            res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
            return;
        }
        if (contactName)
            appointment.contact = client._id;
        if (service)
            appointment.service = service;
        if (staffId)
            appointment.staff = staff._id;
        if (leadId)
            appointment.lead = lead._id;
        if (date)
            appointment.date = date;
        if (time)
            appointment.time = time;
        yield appointment.save();
        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully!',
            data: appointment,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateAppointment = updateAppointment;
const getAllAppointments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield appoinment_model_1.default.find()
            .populate('contact')
            .populate('staff')
            .populate('lead');
        if (!appointments || appointments.length === 0) {
            res.status(404).json({ success: false, message: 'No appointments found' });
            return;
        }
        const today = (0, moment_1.default)().startOf('day');
        const updatedAppointments = appointments.map(appointment => {
            const appointmentDate = (0, moment_1.default)(appointment.date);
            let status = 'Upcoming';
            if (appointmentDate.isBefore(today, 'day')) {
                status = 'Completed';
            }
            return Object.assign(Object.assign({}, appointment.toObject()), { status });
        });
        res.status(200).json({
            success: true,
            message: 'Appointments fetched successfully',
            data: updatedAppointments
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllAppointments = getAllAppointments;
const getAppointmentStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, status } = req.query;
        const filterQuery = {};
        if (filter) {
            const regex = { $regex: filter, $options: 'i' };
            filterQuery['$or'] = [
                { 'staff.name': regex },
                { 'contact.name': regex },
                { 'lead.name': regex },
                { 'location.locationName': regex },
                { service: regex },
                { date: regex },
                { time: regex }
            ];
        }
        const allAppointments = yield appoinment_model_1.default.find(filterQuery)
            .populate('staff', 'name')
            .populate('contact', 'name')
            .populate('lead', 'name')
            .exec();
        if (!allAppointments || allAppointments.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No appointments found.',
            });
        }
        const currentDateTime = (0, moment_1.default)();
        let completedAppointmentsCount = 0;
        let upcomingAppointmentsCount = 0;
        const categorizedAppointments = allAppointments.map((appointment) => {
            const appointmentDateTime = (0, moment_1.default)(`${appointment.date}T${appointment.time}`);
            const appointmentStatus = appointmentDateTime.isBefore(currentDateTime) ? 'completed' : 'upcoming';
            if (appointmentStatus === 'completed') {
                completedAppointmentsCount++;
            }
            else {
                upcomingAppointmentsCount++;
            }
            return Object.assign(Object.assign({}, appointment.toObject()), { status: appointmentStatus });
        });
        if (status) {
            const filteredAppointments = categorizedAppointments.filter((appointment) => appointment.status === status);
            res.status(200).json({
                success: true,
                message: `Appointment statistics fetched successfully for status: ${status}`,
                data: {
                    totalAppointments: filteredAppointments.length,
                    completedAppointments: status === 'completed' ? filteredAppointments.length : completedAppointmentsCount,
                    upcomingAppointments: status === 'upcoming' ? filteredAppointments.length : upcomingAppointmentsCount,
                    appointments: filteredAppointments,
                },
            });
        }
        res.status(200).json({
            success: true,
            message: 'Appointment statistics fetched successfully.',
            data: {
                totalAppointments: allAppointments.length,
                completedAppointments: completedAppointmentsCount,
                upcomingAppointments: upcomingAppointmentsCount,
                appointments: categorizedAppointments,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAppointmentStats = getAppointmentStats;
const deleteAppoinment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentId = req.params.id;
    try {
        const deletedAppoinment = yield appoinment_model_1.default.findByIdAndDelete(appointmentId);
        if (!appointmentId) {
            res.status(404).json({
                success: false,
                message: 'Appoinment not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Appoinment deleted successfully!',
            data: deletedAppoinment
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteAppoinment = deleteAppoinment;
