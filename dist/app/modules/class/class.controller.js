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
exports.deleteClass = exports.updateClassStatus = exports.getClassStats = exports.getClassById = exports.getAllClasses = exports.updateClass = exports.createClass = exports.getPredefinedClassNames = void 0;
const class_model_1 = __importDefault(require("./class.model"));
const leads_model_1 = __importDefault(require("../contact/leads.model"));
const staff_model_1 = __importDefault(require("../staff/staff.model"));
const moment_1 = __importDefault(require("moment"));
const location_model_1 = require("../Admin/location.model");
const notification_model_1 = __importDefault(require("../notification/notification.model"));
const getPredefinedClassNames = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classNames = yield class_model_1.default.find().select('name');
        res.status(200).json({
            success: true,
            message: 'Predefined class names fetched successfully.',
            data: classNames
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getPredefinedClassNames = getPredefinedClassNames;
// export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const {
//     name,
//     locationId,
//     schedule,
//     totalCapacity,
//     frequency,
//     workType,
//     leadId,
//     staffId,
//   } = req.body;
//   try {
//     if (!name || !locationId || !schedule || !totalCapacity || !frequency || !workType || !leadId || !staffId) {
//       res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields (name, locationId, schedule, totalCapacity, frequency, workType, leadId, staffId)',
//       });
//       return;
//     }
//     schedule.forEach((item: any) => {
//       if (!item.date || !Array.isArray(item.sessions) || item.sessions.length === 0) {
//         throw new Error(`Invalid session data for date: ${item.date}`);
//       }
//     });
//     const lead = await Lead.findById(leadId);
//     const staff = await Staff.findById(staffId);
//     if (!lead || !staff) {
//       res.status(400).json({
//         success: false,
//         message: 'Lead or Staff not found.',
//       });
//       return;
//     }
//     const location = await Location.findById(locationId);
//     if (!location) {
//       res.status(400).json({
//         success: false,
//         message: 'Location not found.',
//       });
//       return;
//     }
//     const newClass = new Class({
//       name,
//       location: location._id,
//       schedule,
//       totalCapacity,
//       frequency,
//       workType,
//       lead: lead._id,
//       staff: staff._id,
//     });
//     const savedClass = await newClass.save();
//     // Create notifications for the staff and lead
//     const notificationMessage = `You have been assigned to a new class: ${name}`;
//     const notificationDate = new Date(); // Adjust the scheduled time as needed
//     const notificationData = [
//       { userId: lead._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Class' },
//       { userId: staff._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Class' }
//     ];
//     await Notification.insertMany(notificationData);
//     res.status(201).json({
//       success: true,
//       message: 'Class created and notifications sent!',
//       data: savedClass,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
const createClass = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, locationId, schedule, totalCapacity, frequency, workType, leadId, staffId, } = req.body;
    try {
        if (!name || !locationId || !schedule || !totalCapacity || !frequency || !workType || !leadId || !staffId) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, locationId, schedule, totalCapacity, frequency, workType, leadId, staffId)',
            });
            return;
        }
        schedule.forEach((item) => {
            if (!item.date || !Array.isArray(item.sessions) || item.sessions.length === 0) {
                throw new Error(`Invalid session data for date: ${item.date}`);
            }
        });
        const lead = yield leads_model_1.default.findById(leadId);
        const staff = yield staff_model_1.default.findById(staffId);
        if (!lead || !staff) {
            res.status(400).json({
                success: false,
                message: 'Lead or Staff not found.',
            });
            return;
        }
        const location = yield location_model_1.Location.findById(locationId);
        if (!location) {
            res.status(400).json({
                success: false,
                message: 'Location not found.',
            });
            return;
        }
        const newClass = new class_model_1.default({
            name,
            location: location._id,
            schedule,
            totalCapacity,
            frequency,
            workType,
            lead: lead._id,
            staff: staff._id,
        });
        const savedClass = yield newClass.save();
        const notificationMessage = `You have been assigned to a new class: ${name}`;
        const notificationDate = new Date();
        const notificationData = [
            {
                userId: lead._id,
                userModel: 'Lead',
                message: notificationMessage,
                scheduledTime: notificationDate,
                type: 'Class'
            },
            {
                userId: staff._id,
                userModel: 'Staff',
                message: notificationMessage,
                scheduledTime: notificationDate,
                type: 'Class'
            }
        ];
        yield notification_model_1.default.insertMany(notificationData);
        res.status(201).json({
            success: true,
            message: 'Class created and notifications sent!',
            data: savedClass,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createClass = createClass;
const updateClass = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId } = req.params;
    const { name, location, schedule, totalCapacity, frequency, workType, leadId, staffId, } = req.body;
    try {
        const classToUpdate = yield class_model_1.default.findById(classId).exec();
        if (!classToUpdate) {
            res.status(404).json({
                success: false,
                message: 'Class not found.',
            });
            return;
        }
        if (name)
            classToUpdate.name = name;
        if (location)
            classToUpdate.location = location;
        if (schedule)
            classToUpdate.schedule = schedule;
        if (totalCapacity)
            classToUpdate.totalCapacity = totalCapacity;
        if (frequency)
            classToUpdate.frequency = frequency;
        if (workType)
            classToUpdate.workType = workType;
        if (leadId) {
            const lead = yield leads_model_1.default.findById(leadId);
            if (lead)
                classToUpdate.lead = lead._id;
        }
        // Update staff
        if (staffId) {
            const staff = yield staff_model_1.default.findById(staffId);
            if (staff)
                classToUpdate.staff = staff._id;
        }
        yield classToUpdate.save();
        const updatedClass = yield classToUpdate.populate('lead staff');
        res.status(200).json({
            success: true,
            message: 'Class updated successfully!',
            data: updatedClass,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateClass = updateClass;
const getAllClasses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) {
            if (status !== 'active' && status !== 'inactive') {
                res.status(400).json({
                    success: false,
                    message: "Invalid status. Please use 'active' or 'inactive'."
                });
                return;
            }
            filter = { status: status.trim().toLowerCase() };
        }
        const classes = yield class_model_1.default.find(filter)
            .populate('lead', 'name')
            .populate('staff', 'name')
            .populate('schedule', 'date')
            .populate('location');
        if (!classes || classes.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No classes found.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Classes fetched successfully.',
            data: classes
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllClasses = getAllClasses;
const getClassById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId } = req.params;
    try {
        const classDetails = yield class_model_1.default.findById(classId)
            .populate('lead', 'lead_name')
            .populate('staff', 'name')
            .populate('schedule', 'date startTime duration');
        if (!classDetails) {
            res.status(404).json({
                success: false,
                message: 'Class not found.',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Class fetched successfully.',
            data: classDetails,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getClassById = getClassById;
const getClassStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, status, date, locationName, staff, className, lead } = req.query;
        const filterQuery = {};
        if (filter) {
            const filterText = filter.toString().trim();
            filterQuery['$or'] = [
                { 'name': { $regex: filterText, $options: 'i' } },
                { 'description': { $regex: filterText, $options: 'i' } },
                { 'staff.name': { $regex: filterText, $options: 'i' } },
                { 'location.locationName': { $regex: filterText, $options: 'i' } }
            ];
        }
        // Handle status filter correctly
        if (status) {
            if (status === 'running') {
                filterQuery['status'] = 'active';
            }
            else if (status === 'not running') {
                filterQuery['status'] = 'inactive';
            }
        }
        // Handle specific locationName filter
        if (locationName) {
            filterQuery['location.locationName'] = locationName;
        }
        if (staff) {
            filterQuery['staff.name'] = staff;
        }
        if (className) {
            filterQuery['name'] = className;
        }
        if (lead) {
            filterQuery['lead.lead_name'] = lead;
        }
        // Handle date filter
        if (date) {
            const selectedDate = (0, moment_1.default)(typeof date === 'string' ? date : '').startOf('day');
            filterQuery['schedule.date'] = { $gte: selectedDate.toDate() };
        }
        const allClasses = yield class_model_1.default.find(filterQuery)
            .populate('lead', 'lead_name')
            .populate('staff', 'name')
            .populate('location', 'locationName')
            .exec();
        if (!allClasses || allClasses.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No classes found.',
            });
            return;
        }
        const currentDate = (0, moment_1.default)();
        let runningClassesCount = 0;
        let completedClassesCount = 0;
        let notRunningClassesCount = 0;
        allClasses.forEach((classItem) => {
            classItem.schedule.forEach((session) => {
                const sessionDate = (0, moment_1.default)(session.date);
                const isClassActive = classItem.status === 'active';
                if (sessionDate.isBefore(currentDate) && !isClassActive) {
                    completedClassesCount++;
                }
                else if (isClassActive && sessionDate.isSameOrAfter(currentDate)) {
                    runningClassesCount++;
                }
                else if (!isClassActive && sessionDate.isSameOrAfter(currentDate)) {
                    notRunningClassesCount++;
                }
            });
        });
        res.status(200).json({
            success: true,
            message: 'Classes fetched successfully.',
            data: {
                totalClasses: allClasses.length,
                runningClassesCount,
                completedClassesCount,
                notRunningClassesCount,
                classesData: allClasses,
            },
        });
    }
    catch (err) {
        console.error('Error occurred:', err);
        next(err);
    }
});
exports.getClassStats = getClassStats;
const updateClassStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId } = req.params;
    const { status } = req.body;
    if (!status || (status !== 'active' && status !== 'inactive')) {
        res.status(400).json({
            success: false,
            message: "Invalid status. Please use 'active' or 'inactive'."
        });
    }
    try {
        const classToUpdate = yield class_model_1.default.findById(classId);
        if (!classToUpdate) {
            res.status(404).json({
                success: false,
                message: 'Class not found.'
            });
            return;
        }
        classToUpdate.status = status;
        yield classToUpdate.save();
        res.status(200).json({
            success: true,
            message: 'Class status updated successfully!',
            data: classToUpdate
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateClassStatus = updateClassStatus;
const deleteClass = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId } = req.params;
    try {
        const classToDelete = yield class_model_1.default.findByIdAndDelete(classId);
        if (!classToDelete) {
            res.status(404).json({
                success: false,
                message: 'Class not found.',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Class deleted successfully!',
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteClass = deleteClass;
