import { Request, Response, NextFunction } from 'express';
import Event from './event.model';  
import Appointment from '../../modules/contact/appoinment.model'; 
import { Location } from '../Admin/location.model';
import Class from '../class/class.model'; 
import moment from 'moment';


export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        location,
        startTime,
        duration,
        frequency,
        totalCapacity,
        workType,
        staff,
        status,
        eventDate,
      } = req.body;
  
      if (!name || !location || !startTime || !duration || !frequency || !totalCapacity|| !workType || !staff || !eventDate) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
  
      let recurrenceSchedule = [];
  
      if (frequency === 'Once') {
        if (!eventDate) {
          return res.status(400).json({ message: 'Please provide a date for the "Once" frequency.' });
        }
  

        const eventDateObj = new Date(eventDate);
        if (isNaN(eventDateObj.getTime())) {
          return res.status(400).json({ message: 'Invalid date format provided for the event.' });
        }
        recurrenceSchedule.push(eventDateObj);
      } else {

        const initialClassDate = new Date(startTime); 
  
        if (frequency === 'Weekly') {
          for (let i = 0; i < 4; i++) {
            const newDate = new Date(initialClassDate);
            newDate.setDate(newDate.getDate() + i * 7);  
            recurrenceSchedule.push(newDate);
          }
        } else if (frequency === 'Bi-Weekly') {
          for (let i = 0; i < 4; i++) {
            const newDate = new Date(initialClassDate);
            newDate.setDate(newDate.getDate() + i * 14); 
            recurrenceSchedule.push(newDate);
          }
        } else if (frequency === 'Monthly') {
          for (let i = 0; i < 4; i++) {
            const newDate = new Date(initialClassDate);
            newDate.setMonth(newDate.getMonth() + i);  
            recurrenceSchedule.push(newDate);
          }
        }
      }
  
      const newEvent = new Event({
        name,
        location,
        startTime,
        duration,
        frequency,
        eventDate,
        totalCapacity,
        workType,
        staff,
        status: status || 'active',
        recurrenceSchedule,
      });
      await newEvent.populate('staff')
      await newEvent.populate('location')
  
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
  
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  const { eventId } = req.params; 
  const { name, location, startTime, duration, frequency, totalCapacity, staff, status } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

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
    next(err);  
  }
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const events = await Event.find().populate('staff');
  
      if (!events || events.length === 0) {
        return res.status(404).json({ message: 'No events found' });
      }
  
      const newEvent = await Event.findById(events[0]._id).populate('staff')
      .populate('location')
      
  
      return res.status(200).json({
        success: true,
        message: 'Events fetched successfully!',
        data: events,
        newEvent,  
      });
  
    } catch (err) {
      next(err); 
    }
  };
  
export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  const { eventId } = req.params; 

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
    next(err); 
  }
};

const getDateRange = (range: string) => {
  const now = moment();

  switch (range) {
    case 'today':
      return {
        startDate: now.startOf('day').toDate(),
        endDate: now.endOf('day').toDate(),
      };
    case 'thisWeek':
      return {
        startDate: now.startOf('week').toDate(),
        endDate: now.endOf('week').toDate(),
      };
    case 'thisMonth':
      return {
        startDate: now.startOf('month').toDate(), 
        endDate: now.endOf('month').toDate(),
      };
    default:
      return { startDate: null, endDate: null };
  }
};

export const getUpcomingAndPastAppointmentsEventsClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { location, dateRange } = req.query;

    const { startDate, endDate } = getDateRange(dateRange as string);
    const now = new Date();

    let appointmentLocationFilter = {};
    let eventLocationFilter = {};
    let classLocationFilter = {};

    if (location) {
      const locationDoc = await Location.findOne({
        locationName: new RegExp(String(location), 'i') 
      }).select('_id locationName');


      if (locationDoc) {
        appointmentLocationFilter = { location: locationDoc._id };
        classLocationFilter = { location: locationDoc._id };

        eventLocationFilter = {
          locationName: new RegExp(String(location), 'i')
        };
      } else {

        const eventWithLocation = await Event.findOne({
          locationName: new RegExp(String(location), 'i')
        });

        if (eventWithLocation) {
        } else {
          res.status(400).json({
            success: false,
            message: 'Location not found in the database.',
          });
          return;
        }
      }
    }

    const allAppointments = await Appointment.find(appointmentLocationFilter)
      .populate('contact')
      .populate('staff')
      .populate('lead')
      .populate('location');

    const upcomingAppointments = allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);

      if (appointmentDate < now) return false;

      if (startDate && endDate) {
        return appointmentDate >= startDate && appointmentDate <= endDate;
      }

      return true;
    });

    const pastAppointments = allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);

      if (appointmentDate >= now) return false;

      if (startDate && endDate) {
        return appointmentDate >= startDate && appointmentDate <= endDate;
      }

      return true;
    });

    const getEventQuery = (isPast: boolean) => {
      const query: any = {
        ...eventLocationFilter
      };

      if (isPast) {
        query.eventDate = { $lt: now };
      } else {
        query.eventDate = { $gte: now };
      }

      if (startDate && endDate) {
        query.eventDate = {
          ...(isPast ? { $lt: now } : { $gte: now }),
          $gte: startDate,
          $lte: endDate
        };
      }

      return query;
    };

    const upcomingEvents = await Event.find(getEventQuery(false))
      .populate('staff')
      .populate('location');

    const pastEvents = await Event.find(getEventQuery(true))
      .populate('staff')
      .populate('location');

    const allClasses = await Class.find(classLocationFilter)
      .populate('staff')
      .populate('lead')
      .populate('location');

    const upcomingClasses = allClasses.filter(classItem => {
      return classItem.status === 'active' && classItem.schedule.some(session => {
        const classDate = new Date(session.date);

        if (classDate < now) return false;

        if (startDate && endDate) {
          return classDate >= startDate && classDate <= endDate;
        }

        return true;
      });
    });

    const pastClasses = allClasses.filter(classItem => {
      return classItem.status === 'active' && classItem.schedule.some(session => {
        const classDate = new Date(session.date);

        if (classDate >= now) return false;

        if (startDate && endDate) {
          return classDate >= startDate && classDate <= endDate;
        }

        return true;
      });
    });

    res.status(200).json({
      success: true,
      message: 'Upcoming and past appointments, events, and classes retrieved successfully!',
      data: {
        upcomingAppointments,
        pastAppointments,
        upcomingEvents,
        pastEvents,
        upcomingClasses,
        pastClasses,
      },
    });

  } catch (err) {
    next(err);
  }
};

export const getUpcomingAndPastAppointmentsEventsClassesWithFilter = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { location, dateRange, staffId } = req.query;
    const { startDate, endDate } = getDateRange(dateRange as string);
    const now = new Date();

    const locationFilter = location ? { location } : {};
    const staffFilter = staffId ? { staff: staffId } : {};  

    const allAppointments = await Appointment.find({ ...locationFilter, ...staffFilter })
      .populate('contact')
      .populate('staff')
      .populate('lead')
      .populate('location');
    
    const upcomingAppointments = allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      if (appointmentDate < now) return false;
      
      if (startDate && endDate) {
        return appointmentDate >= startDate && appointmentDate <= endDate;
      }
      
      return true;
    });
    
    const pastAppointments = allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      if (appointmentDate >= now) return false;
      
      if (startDate && endDate) {
        return appointmentDate >= startDate && appointmentDate <= endDate;
      }
      
      return true;
    });

    const getEventQuery = (isPast: boolean) => {
      const query: any = {
        ...locationFilter,
        ...staffFilter 
      };
      
      if (isPast) {
        query.eventDate = { $lt: now };
      } else {
        query.eventDate = { $gte: now };
      }

      if (startDate && endDate) {
        query.eventDate = {
          ...(isPast ? { $lt: now } : { $gte: now }),
          $gte: startDate,
          $lte: endDate
        };
      }

      return query;
    };

    const upcomingEvents = await Event.find(getEventQuery(false))
      .populate('staff');

    const pastEvents = await Event.find(getEventQuery(true))
      .populate('staff');

    const allClasses = await Class.find({ ...locationFilter, ...staffFilter })
      .populate('staff')
      .populate('lead');
    
    const upcomingClasses = allClasses.filter(classItem => {
      return classItem.schedule.some(session => {
        const classDate = new Date(session.date); 
        
        if (classDate < now) return false;
        
        if (startDate && endDate) {
          return classDate >= startDate && classDate <= endDate;
        }
        
        return true;
      });
    });
    
    const pastClasses = allClasses.filter(classItem => {
      return classItem.schedule.some(session => {
        const classDate = new Date(session.date);
        
        if (classDate >= now) return false;
        
        if (startDate && endDate) {
          return classDate >= startDate && classDate <= endDate;
        }
        
        return true;
      });
    });

    res.status(200).json({
      success: true,
      message: 'Upcoming and past appointments, events, and classes retrieved successfully!',
      data: {
        upcomingAppointments,
        pastAppointments,
        upcomingEvents,
        pastEvents,
        upcomingClasses,
        pastClasses,
      },
    });
  } catch (err) {
    next(err); 
  }
};

