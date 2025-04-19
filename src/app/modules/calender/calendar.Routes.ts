
import express from 'express';
import {  bookAppointment, getAllAppointments, getFilteredData } from './calendar.controller';

const CalendarRoutes = express.Router();

CalendarRoutes.post('/book', bookAppointment);
CalendarRoutes.get('/all', getAllAppointments);
CalendarRoutes.get('/allFillter', getFilteredData);

export default CalendarRoutes;

