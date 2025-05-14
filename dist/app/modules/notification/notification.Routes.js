"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const notification_controller_1 = require("./notification.controller");
const notification = express_1.default.Router();
notification.get('/admin', auth_1.authenticateAdmin, notification_controller_1.getNotifications);
exports.default = notification;
