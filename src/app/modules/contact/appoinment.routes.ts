import express from 'express';
import { getAllAppointments, bookAppointment, updateAppointment, deleteAppoinment, getAppointmentStats } from './appoinment.controller';
import { authenticateUser } from '../../middlewares/auth';

const AppointmentRoutes = express.Router();
AppointmentRoutes.get('/all', getAllAppointments);
AppointmentRoutes.get('/getstats', getAppointmentStats);
AppointmentRoutes.post('/book',bookAppointment);
AppointmentRoutes.put('/update/:appointmentId', updateAppointment);
AppointmentRoutes.delete('/delete/:id', deleteAppoinment);

export default AppointmentRoutes;
