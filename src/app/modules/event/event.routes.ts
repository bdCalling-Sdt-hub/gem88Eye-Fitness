import express from 'express';
import { createEvent, updateEvent, deleteEvent, getAllEvents } from './event.controller';  // Import the controllers

const EventRoutes = express.Router();
EventRoutes.get('/', getAllEvents);
EventRoutes.post('/', createEvent);
EventRoutes.put('/:eventId', updateEvent);
EventRoutes.delete('/:eventId', deleteEvent);

export default EventRoutes;
