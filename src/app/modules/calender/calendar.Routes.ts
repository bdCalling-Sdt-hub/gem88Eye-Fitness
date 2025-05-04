
import express from 'express';
import {  allCalendar, bookAppointment, getAllAppointments, getFilteredData } from './calendar.controller';

const CalendarRoutes = express.Router();

CalendarRoutes.post('/book', bookAppointment);
CalendarRoutes.get('/all', getAllAppointments);
CalendarRoutes.get('/allFillter', getFilteredData);
CalendarRoutes.get('/get', allCalendar);

export default CalendarRoutes;

