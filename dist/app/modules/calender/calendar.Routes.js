"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calendar_controller_1 = require("./calendar.controller");
const CalendarRoutes = express_1.default.Router();
CalendarRoutes.post('/book', calendar_controller_1.bookAppointment);
CalendarRoutes.get('/all', calendar_controller_1.getAllAppointments);
CalendarRoutes.get('/allFillter', calendar_controller_1.getFilteredData);
CalendarRoutes.get('/get', calendar_controller_1.allCalendar);
exports.default = CalendarRoutes;
