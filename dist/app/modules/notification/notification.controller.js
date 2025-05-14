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
exports.markNotificationAsRead = exports.getNotifications = void 0;
const notification_model_1 = __importDefault(require("./notification.model"));
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = req.admin;
        if (!admin || !admin.id) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const typeFilter = req.query.type ? { type: req.query.type } : {};
        const dateFilter = req.query.dateFrom && req.query.dateTo ? {
            scheduledTime: {
                $gte: new Date(req.query.dateFrom),
                $lte: new Date(req.query.dateTo)
            }
        } : {};
        const statusFilter = req.query.status === 'read' ? { isRead: true } :
            req.query.status === 'unread' ? { isRead: false } : {};
        const filters = Object.assign(Object.assign(Object.assign({ userId: admin.id }, typeFilter), dateFilter), statusFilter);
        const notifications = yield notification_model_1.default.find(filters)
            .sort({ scheduledTime: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalNotifications = yield notification_model_1.default.countDocuments(filters);
        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully.',
            data: notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit),
                totalNotifications,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getNotifications = getNotifications;
const markNotificationAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = req.params;
        const admin = req.admin;
        if (!admin || !admin.id) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        const notification = yield notification_model_1.default.findOne({
            _id: notificationId,
            userId: admin.id
        });
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        notification.isRead = true;
        yield notification.save();
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    }
    catch (err) {
        next(err);
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
