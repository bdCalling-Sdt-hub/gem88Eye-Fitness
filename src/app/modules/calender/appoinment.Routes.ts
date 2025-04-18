
import express from 'express';
import {  bookAppointment, getAllAppointments, getFilteredData } from './appoinment';

const CalendarRoutes = express.Router();

// AppointmentRoutes.get('/all', getAllAppointments);
CalendarRoutes.post('/book', bookAppointment);
CalendarRoutes.get('/all', getAllAppointments);
CalendarRoutes.get('/allFillter', getFilteredData);

export default CalendarRoutes;

