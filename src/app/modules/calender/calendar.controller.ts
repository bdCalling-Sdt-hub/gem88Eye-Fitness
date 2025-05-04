import { Request, Response, NextFunction } from 'express';
import Appointment from '../contact/appoinment.model';
import Client from '../contact/client.model'; 
import Staff from '../staff/staff.model';   
import Lead from '../contact/leads.model';     
import Event from '../event/event.model';
import Class from '../class/class.model';
import moment from 'moment';


export const bookAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { clientId, service, staffId, leadId, date, time } = req.body;

  if (!clientId || !service || !staffId || !leadId || !date || !time) {
    res.status(400).json({ success: false, message: 'All fields are required!' });
    return;
  }

  try {
    const client = await Client.findById(clientId);
    const staff = await Staff.findById(staffId);
    const lead = await Lead.findById(leadId);

    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff not found' });
      return;
    }

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const newAppointment = new Appointment({
      contact: client._id,
      service,
      staff: staff._id,
      lead: lead._id,
      class: lead._id,
      date,
      time,
    });

    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: newAppointment
    });
  } catch (err) {
    console.error('Error during appointment booking:', err);
    next(err); 
  }
};
export const getAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await Appointment.find()
        .populate('contact')
        .populate('staff')  
        .populate('lead');
  

      if (appointments.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No appointments found'
        });
        return;
      }
  
      res.status(200).json({
        success: true,
        message: 'Appointments fetched successfully',
        data: appointments
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      next(err); 
    }
  };


  export const getFilteredData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, staffId, locationName, className, service, date, startDate, endDate } = req.query;

      const filter: any = {};

      if (staffId) {
        filter.staff = staffId;
      }

      if (locationName) {
        filter.locationName = locationName;
      }

      if (className) {
        filter.name = className;
      }
  
      if (service) {
        filter.service = service;
      }
  
      if (date) {
        const eventDate = new Date(date as string);
        if (isNaN(eventDate.getTime())) {
          res.status(400).json({ message: "Invalid date format" });
          return;
        }
        filter.eventDate = eventDate;
      }
  
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          res.status(400).json({ message: "Invalid start or end date format" });
          return;
        }
        filter.eventDate = { $gte: start, $lte: end };
      }
      if (type) {
        let result: any;
        if (type === 'event') {
          result = await Event.find(filter).populate('staff'); 
        } else if (type === 'appointment') {
          result = await Appointment.find(filter).populate('staff contact lead');
        } else if (type === 'class') {
          result = await Class.find(filter)
            .populate('staff')  
            .populate('location') 
            .populate('lead'); 
        } else {
          res.status(400).json({ message: "Invalid type specified. Choose between 'event', 'appointment', or 'class'" });
          return;
        }
  
        res.status(200).json({
          success: true,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} data fetched successfully.`,
          data: result
        });
        return;
      }
  
      const events = await Event.find(filter).populate('staff'); 
      const appointments = await Appointment.find(filter).populate('staff contact lead');  
      const classes = await Class.find(filter)
        .populate('staff') 
        .populate('location') 
        .populate('lead'); 
  
      const result = {
        events,
        appointments,
        classes
      };

      res.status(200).json({
        success: true,
        message: 'Filtered data fetched successfully.',
        data: result
      });
    } catch (error) {
      console.error("Error fetching data:", error); 
      res.status(500).json({ message: 'Error fetching filtered data', error: error });
    }
  };
 
  export const allCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, staffId, locationName, className, service, date, startDate, endDate } = req.query;

      const filter: any = {};

      if (staffId) {
        filter.staff = staffId;
      }

      if (locationName) {
        filter.locationName = locationName;
      }

      if (className) {
        filter.name = className;
      }
  
      if (service) {
        filter.service = service;
      }
  
      if (date) {
        const eventDate = new Date(date as string);
        if (isNaN(eventDate.getTime())) {
          res.status(400).json({ message: "Invalid date format" });
          return;
        }
        filter.eventDate = eventDate;
      }
  
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          res.status(400).json({ message: "Invalid start or end date format" });
          return;
        }
        filter.eventDate = { $gte: start, $lte: end };
      }

      let result: any = [];
  
      if (type) {
        if (type === 'event') {
          result = await Event.find(filter).populate('staff'); 
        } else if (type === 'appointment') {
          result = await Appointment.find(filter).populate('staff contact lead');
        } else if (type === 'class') {
          result = await Class.find(filter)
            .populate('staff')  
            .populate('location') 
            .populate('lead'); 
        } else {
          res.status(400).json({ message: "Invalid type specified. Choose between 'event', 'appointment', or 'class'" });
          return;
        }
      } else {
        const events = await Event.find(filter).populate('staff'); 
        const appointments = await Appointment.find(filter).populate('staff contact lead');  
        const classes = await Class.find(filter)
          .populate('staff') 
          .populate('location') 
          .populate('lead'); 

        result = [...events, ...appointments, ...classes];
      }

      res.status(200).json({
        success: true,
        message: 'Filtered data fetched successfully.',
        data: result
      });
    } catch (error) {
      console.error("Error fetching data:", error); 
      res.status(500).json({ message: 'Error fetching filtered data', error: error });
    }
  };


  