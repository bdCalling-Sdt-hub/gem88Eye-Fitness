"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appoinment_controller_1 = require("./appoinment.controller");
const AppointmentRoutes = express_1.default.Router();
AppointmentRoutes.get('/all', appoinment_controller_1.getAllAppointments);
AppointmentRoutes.get('/getstats', appoinment_controller_1.getAppointmentStats);
AppointmentRoutes.post('/book', appoinment_controller_1.bookAppointment);
AppointmentRoutes.put('/update/:appointmentId', appoinment_controller_1.updateAppointment);
AppointmentRoutes.delete('/delete/:id', appoinment_controller_1.deleteAppoinment);
exports.default = AppointmentRoutes;
