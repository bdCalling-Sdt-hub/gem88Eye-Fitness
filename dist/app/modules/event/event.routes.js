"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_controller_1 = require("./event.controller"); // Import the controllers
const EventRoutes = express_1.default.Router();
EventRoutes.get('/', event_controller_1.getAllEvents);
EventRoutes.post('/', event_controller_1.createEvent);
EventRoutes.put('/:eventId', event_controller_1.updateEvent);
EventRoutes.delete('/:eventId', event_controller_1.deleteEvent);
EventRoutes.get('/home', event_controller_1.getUpcomingAndPastAppointmentsEventsClasses);
EventRoutes.get('/calendar', event_controller_1.getUpcomingAndPastAppointmentsEventsClassesWithFilter);
exports.default = EventRoutes;
