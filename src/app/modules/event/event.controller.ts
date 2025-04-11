import { Request, Response, NextFunction } from 'express';
import Event from './event.model';  // Import the Event model

// Create Event
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        location,
        startTime,
        duration,
        frequency,
        totalCapacity,
        staff,
        status,
        eventDate,
      } = req.body;
  
      if (!name || !location || !startTime || !duration || !frequency || !totalCapacity || !staff || !eventDate) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
  
      let recurrenceSchedule = [];
  
      if (frequency === 'Once') {
        if (!eventDate) {
          return res.status(400).json({ message: 'Please provide a date for the "Once" frequency.' });
        }
  
        // Parse the eventDate and convert to Date object
        const eventDateObj = new Date(eventDate);
        if (isNaN(eventDateObj.getTime())) {
          return res.status(400).json({ message: 'Invalid date format provided for the event.' });
        }
        recurrenceSchedule.push(eventDateObj);
      } else {
        // Handle other frequencies (Weekly, Bi-Weekly, Monthly) as you already do
        const initialClassDate = new Date(startTime);  // Convert to date object
  
        if (frequency === 'Weekly') {
          for (let i = 0; i < 4; i++) {
            const newDate = new Date(initialClassDate);
            newDate.setDate(newDate.getDate() + i * 7);  // Add 7 days for weekly recurrence
            recurrenceSchedule.push(newDate);
          }
        } else if (frequency === 'Bi-Weekly') {
          for (let i = 0; i < 4; i++) {
            const newDate = new Date(initialClassDate);
            newDate.setDate(newDate.getDate() + i * 14);  // Add 14 days for bi-weekly recurrence
            recurrenceSchedule.push(newDate);
          }
        } else if (frequency === 'Monthly') {
          for (let i = 0; i < 4; i++) {
            const newDate = new Date(initialClassDate);
            newDate.setMonth(newDate.getMonth() + i);  // Add 1 month for monthly recurrence
            recurrenceSchedule.push(newDate);
          }
        }
      }
  
      // Create the new event
      const newEvent = new Event({
        name,
        location,
        startTime,
        duration,
        frequency,
        eventDate,
        totalCapacity,
        staff,
        status: status || 'active',
        recurrenceSchedule,
      });
      await newEvent.populate('staff');
  
      await newEvent.save();
  
      return res.status(201).json({
        success: true,
        message: 'Event created successfully!',
        data: newEvent,
      });
    } catch (err) {
      next(err);
    }
  };
  

// Update Event
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  const { eventId } = req.params;  // Extract the event ID from the URL parameters
  const { name, location, startTime, duration, frequency, totalCapacity, staff, status } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update event fields
    event.name = name || event.name;
    event.location = location || event.location;
    event.startTime = startTime || event.startTime;
    event.duration = duration || event.duration;
    event.frequency = frequency || event.frequency;
    event.totalCapacity = totalCapacity || event.totalCapacity;
    event.staff = staff || event.staff;
    event.status = status || event.status;


    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: event
    
    });
  } catch (err) {
    next(err);  // Pass error to global error handler
  }
};

//get all events
export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch all events and populate the staff field
      const events = await Event.find().populate('staff');  // Populate the staff field with the actual staff details
  
      if (!events || events.length === 0) {
        return res.status(404).json({ message: 'No events found' });
      }
  
      // You can fetch the first event if needed (not necessary in most cases)
      const newEvent = await Event.findById(events[0]._id).populate('staff');
  
      return res.status(200).json({
        success: true,
        message: 'Events fetched successfully!',
        data: events,
        newEvent,  
      });
  
    } catch (err) {
      next(err); // Pass the error to the global error handler
    }
  };
  

// Delete Event
export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  const { eventId } = req.params;  // Extract the event ID from the URL parameters

  try {
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully!',
    });
  } catch (err) {
    next(err);  // Pass error to global error handler
  }
};
