import express from 'express';
import { createEvent, updateEvent, deleteEvent, getAllEvents, getUpcomingAndPastAppointmentsEventsClasses, getUpcomingAndPastAppointmentsEventsClassesWithFilter } from './event.controller';  // Import the controllers

const EventRoutes = express.Router();
EventRoutes.get('/', getAllEvents);
EventRoutes.post('/', createEvent);
EventRoutes.put('/:eventId', updateEvent);
EventRoutes.delete('/:eventId', deleteEvent);
EventRoutes.get('/home', getUpcomingAndPastAppointmentsEventsClasses);
EventRoutes.get('/calendar', getUpcomingAndPastAppointmentsEventsClassesWithFilter);

export default EventRoutes;
