// src/app/routes/appointmentRoutes.ts
import express from 'express';
import { getAllAppointments, bookAppointment, updateAppointment, deleteAppoinment } from './appoinment.controller';
import { authenticateUser } from '../../middlewares/auth';

const AppointmentRoutes = express.Router();
AppointmentRoutes.get('/all', getAllAppointments);
AppointmentRoutes.post('/book',bookAppointment);
AppointmentRoutes.put('/update/:appointmentId', updateAppointment);
AppointmentRoutes.delete('/delete/:id', deleteAppoinment);

export default AppointmentRoutes;
