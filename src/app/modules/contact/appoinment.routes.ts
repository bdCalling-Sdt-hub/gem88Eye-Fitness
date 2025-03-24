// src/app/routes/appointmentRoutes.ts
import express from 'express';
import { getAllAppointments, bookAppointment } from './appoinment.controller';

const AppointmentRoutes = express.Router();
AppointmentRoutes.get('/all', getAllAppointments);
AppointmentRoutes.post('/book', bookAppointment);

export default AppointmentRoutes;
