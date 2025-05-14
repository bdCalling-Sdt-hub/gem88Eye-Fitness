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
exports.updateLeadStatus = exports.getAllLeads = exports.deleteLead = exports.sendEmailToLead = exports.getLeadById = exports.updateLead = exports.updateLeadsFromCsv = exports.addLead = void 0;
const leads_model_1 = __importDefault(require("./leads.model"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const fs_1 = __importDefault(require("fs"));
const appoinment_model_1 = __importDefault(require("./appoinment.model"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const class_model_1 = __importDefault(require("../class/class.model"));
const uploadCSV = (0, fileUploadHandler_1.default)();
const addLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, companyName, lead_email, address, gender, phone, staff, lead, note } = req.body;
    if (!name || !lead_email || !address || !gender || !phone) {
        res.status(400).json({ success: false, message: 'All fields are required!' });
        return;
    }
    try {
        const newLead = new leads_model_1.default({
            name,
            companyName,
            lead_email,
            address,
            gender,
            phone,
            staff,
            lead,
            note,
        });
        yield newLead.save();
        res.status(201).json({
            success: true,
            message: 'Lead added successfully!',
            data: newLead,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.addLead = addLead;
const updateLeadsFromCsv = (req, res, next) => {
    uploadCSV(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'File upload failed',
                error: err.message,
            });
        }
        const uploadedFile = req.files['documents'][0];
        const filePath = uploadedFile.path;
        const leadsData = [];
        const leadsExist = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (row) => __awaiter(void 0, void 0, void 0, function* () {
            const { name, lead_email, address, gender, phone } = row;
            if (name && lead_email && address && gender && phone) {
                try {
                    const existingLead = yield leads_model_1.default.findOne({ lead_email });
                    if (existingLead) {
                        const updatedLead = yield leads_model_1.default.findOneAndUpdate({ lead_email }, { name, address, gender, phone }, { new: true });
                        leadsData.push(updatedLead);
                        leadsExist.push(updatedLead);
                    }
                    else {
                        const newLead = new leads_model_1.default({
                            name,
                            lead_email,
                            address,
                            gender,
                            phone,
                        });
                        yield newLead.save();
                        leadsData.push(newLead);
                    }
                }
                catch (error) {
                    console.error(`Error processing lead with email ${lead_email}:`, error);
                }
            }
        }))
            .on('end', () => {
            fs_1.default.unlinkSync(filePath);
            const message = leadsExist.length > 0
                ? `Leads updated successfully from CSV! ${leadsExist.length} leads were updated.`
                : 'Leads updated successfully from CSV! All new leads were created.';
            res.status(200).json({
                success: true,
                message: message,
                data: leadsData,
            });
        })
            .on('error', (error) => {
            fs_1.default.unlinkSync(filePath);
            return res.status(500).json({
                success: false,
                message: 'Error while parsing CSV',
                error: error.message,
            });
        });
    });
};
exports.updateLeadsFromCsv = updateLeadsFromCsv;
const updateLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { leadId } = req.params;
    const { name, companyName, lead_email, address, gender, phone, staff, lead, note } = req.body;
    try {
        const leadToUpdate = yield leads_model_1.default.findById(leadId);
        if (!leadToUpdate) {
            res.status(404).json({ success: false, message: 'Lead not found!' });
            return;
        }
        if (name)
            leadToUpdate.name = name;
        if (lead_email)
            leadToUpdate.lead_email = lead_email;
        if (address)
            leadToUpdate.address = address;
        if (gender)
            leadToUpdate.gender = gender;
        if (phone)
            leadToUpdate.phone = phone;
        if (staff)
            leadToUpdate.staff = staff;
        if (lead)
            leadToUpdate.lead = lead;
        if (note)
            leadToUpdate.note = note;
        if (companyName)
            leadToUpdate.companyName = companyName;
        yield leadToUpdate.save();
        res.status(200).json({
            success: true,
            message: 'Lead updated successfully!',
            data: leadToUpdate,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateLead = updateLead;
const getLeadById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { leadId } = req.params;
    const { filter } = req.query;
    try {
        // Fetch the lead by ID
        const lead = yield leads_model_1.default.findById(leadId)
            .populate('staff', 'name')
            .populate('lead', 'name');
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found' });
            return;
        }
        const appointments = yield appoinment_model_1.default.find({ lead: leadId })
            .populate('staff', 'name')
            .populate('lead', 'name');
        const classes = yield class_model_1.default.find({ lead: leadId })
            .populate('staff', 'name')
            .populate('lead', 'name')
            .populate('schedule', 'date');
        const currentDate = new Date();
        // Filtering logic based on the filter query
        let filteredAppointments = appointments;
        let filteredClasses = classes;
        if (filter) {
            if (filter === 'upcoming') {
                filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) > currentDate);
                filteredClasses = classes.filter((classItem) => {
                    return classItem.schedule.some(session => new Date(session.date) > currentDate);
                });
            }
            else if (filter === 'past') {
                filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) <= currentDate);
                filteredClasses = classes.filter((classItem) => {
                    return classItem.schedule.every(session => new Date(session.date) <= currentDate);
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: 'Invalid filter type. Use "upcoming" or "past".',
                });
                return;
            }
        }
        // Prepare the response data, showing the lead with empty arrays if no appointments or classes
        const responseData = {
            lead,
            upcomingAppointments: filteredAppointments.length > 0 ? filteredAppointments : [],
            pastAppointments: filteredAppointments.length > 0 ? filteredAppointments : [],
            upcomingClasses: filteredClasses.length > 0 ? filteredClasses : [],
            pastClasses: filteredClasses.length > 0 ? filteredClasses : [],
        };
        // Send response, without error about missing appointments/classes
        res.status(200).json({
            success: true,
            message: 'Lead profile with filtered appointments and classes retrieved successfully',
            data: responseData,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getLeadById = getLeadById;
const sendEmailToLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { leadId, subject, html } = req.body;
    try {
        const lead = yield leads_model_1.default.findById(leadId);
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found' });
            return;
        }
        yield emailHelper_1.emailHelper.sendEmail({
            to: lead.lead_email,
            subject,
            html,
        });
        res.status(200).json({
            success: true,
            message: `Email sent successfully to ${lead.lead_email}`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.sendEmailToLead = sendEmailToLead;
const deleteLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const leadId = req.params.id;
    try {
        const deletedLead = yield leads_model_1.default.findByIdAndDelete(leadId);
        if (!deletedLead) {
            res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Lead deleted successfully!',
            data: deletedLead
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteLead = deleteLead;
const getAllLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leads = yield leads_model_1.default.find();
        res.status(200).json({
            success: true,
            data: leads,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllLeads = getAllLeads;
const updateLeadStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const leadId = req.params.id;
    const { active } = req.body;
    if (typeof active !== 'boolean') {
        res.status(400).json({
            success: false,
            message: 'Active status must be a boolean value (true or false).'
        });
    }
    try {
        const updatedLead = yield leads_model_1.default.findOneAndUpdate({ leadId: leadId }, { active }, { new: true });
        if (!updatedLead) {
            res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }
        res.status(200).json({
            success: true,
            message: `Lead status updated to ${active ? 'active' : 'inactive'}`,
            data: updatedLead
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateLeadStatus = updateLeadStatus;
