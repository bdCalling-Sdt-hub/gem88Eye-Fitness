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
exports.createAdminNotifications = exports.scheduleNotification = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const notification_model_1 = __importDefault(require("../app/modules/notification/notification.model"));
const admin_model_1 = __importDefault(require("../app/modules/Admin/admin.model"));
const staff_model_1 = __importDefault(require("../app/modules/staff/staff.model"));
const leads_model_1 = __importDefault(require("../app/modules/contact/leads.model"));
const scheduleNotification = (userId_1, message_1, scheduledTime_1, type_1, io_1, ...args_1) => __awaiter(void 0, [userId_1, message_1, scheduledTime_1, type_1, io_1, ...args_1], void 0, function* (userId, message, scheduledTime, type, io, sendImmediately = false) {
    try {
        let user;
        user = yield admin_model_1.default.findById(userId);
        if (user) {
            console.log("Found Admin:", user);
        }
        else {
            user = yield staff_model_1.default.findById(userId);
            if (user) {
                console.log("Found Staff:", user);
            }
            else {
                user = yield leads_model_1.default.findById(userId);
                if (user) {
                    console.log("Found Lead:", user);
                }
            }
        }
        if (!user) {
            console.error(`Invalid userId: ${userId} does not exist in any model.`);
            throw new Error(`Invalid userId: User does not exist in any model for ${userId}`);
        }
        // Create the notification in the database
        const notification = yield notification_model_1.default.create({
            userId,
            userModel: user instanceof admin_model_1.default ? 'Admin' : user instanceof staff_model_1.default ? 'Staff' : 'Lead',
            message,
            scheduledTime,
            type,
            isRead: false,
            isSent: false,
        });
        // If sendImmediately is true, emit the notification right away
        if (sendImmediately && io) {
            io.to(userId).emit('notification', notification);
        }
        // Schedule the notification for the future if not immediate
        if (!sendImmediately) {
            const job = node_schedule_1.default.scheduleJob(scheduledTime, () => __awaiter(void 0, void 0, void 0, function* () {
                // Emit the notification at the scheduled time
                if (io) {
                    io.to(userId).emit('notification', notification);
                }
                // Update the notification as sent
                yield notification_model_1.default.findByIdAndUpdate(notification._id, {
                    isSent: true
                });
            }));
        }
        return notification;
    }
    catch (error) {
        console.error('Error scheduling notification:', error);
        throw error;
    }
});
exports.scheduleNotification = scheduleNotification;
const createAdminNotifications = (eventName, eventType, eventDate, io) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all admins
        const admins = yield admin_model_1.default.find();
        // Create immediate notification
        const immediateNotifications = admins.map(admin => {
            const immediateMessage = `New ${eventType.toLowerCase()} created: ${eventName}`;
            return (0, exports.scheduleNotification)(admin._id, immediateMessage, new Date(), // immediate notification
            eventType, io, true // send immediately
            );
        });
        // Create reminder notification (1 day before the event)
        const reminderDate = new Date(eventDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        // Only schedule reminder if it's in the future
        if (reminderDate > new Date()) {
            const reminderNotifications = admins.map(admin => {
                const reminderMessage = `Reminder: ${eventType} "${eventName}" is scheduled for tomorrow`;
                return (0, exports.scheduleNotification)(admin._id.toString(), reminderMessage, reminderDate, eventType, io, false // schedule for future
                );
            });
            yield Promise.all([...immediateNotifications, ...reminderNotifications]);
        }
        else {
            yield Promise.all(immediateNotifications);
        }
    }
    catch (error) {
        console.error('Error creating admin notifications:', error);
        throw error;
    }
});
exports.createAdminNotifications = createAdminNotifications;
