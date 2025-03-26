
import express from 'express';
import {  bookAppointment, getAllAppointments } from './appoinment';

const AppointmentRoutes = express.Router();

// AppointmentRoutes.get('/all', getAllAppointments);
AppointmentRoutes.post('/book', bookAppointment);
AppointmentRoutes.post('/all', getAllAppointments);

export default AppointmentRoutes;

