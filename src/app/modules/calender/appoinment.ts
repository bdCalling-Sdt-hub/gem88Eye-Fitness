import { Request, Response, NextFunction } from 'express';
import Appointment from '../contact/appoinment.model';  // Assuming your Appointment model is located here
import Client from '../contact/client.model';  // Assuming your Client model is located here
import Staff from '../staff/staff.model';    // Assuming your Staff model is located here
import Lead from '../contact/leads.model';      // Assuming your Lead model is located here
import Event from '../event/event.model';
import Class from '../class/class.model';
import moment from 'moment';


// Book an appointment
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
      console.log(`Client not found with clientId: ${clientId}`);
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    if (!staff) {
      console.log(`Staff not found with staffId: ${staffId}`);
      res.status(404).json({ success: false, message: 'Staff not found' });
      return;
    }

    if (!lead) {
      console.log(`Lead not found with leadId: ${leadId}`);
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


  // export const getFilteredData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     // Extract query parameters for filtering
  //     const { type, staffId, locationName, className, service, date, startDate, endDate} = req.query;
  
  //     // Prepare filter object for appointments, events, and classes
  //     const filter: any = {};
  
  //     // Filter by staffId if provided
  //     if (staffId) {
  //       filter.staff = staffId;
  //     }
  
  //     // Filter by locationName if provided
  //     if (locationName) {
  //       filter.locationName = locationName;
  //     }
  
  //     // Filter by className if provided (for Event or Class models)
  //     if (className) {
  //       filter.name = className; // Assuming 'name' is the class name in your schema
  //     }
  
  //     // Filter by service if provided (for Appointment model)
  //     if (service) {
  //       filter.service = service;
  //     }
  

  
  //     // Filter by date if provided (for Event and Appointment models)
  //     if (date) {
  //       const eventDate = new Date(date as string);
  //       if (isNaN(eventDate.getTime())) {
  //          res.status(400).json({ message: "Invalid date format" });
  //       }
  //       filter.eventDate = eventDate;
  //     }
  
  //     // Filter by startDate and endDate for range filtering
  //     if (startDate && endDate) {
  //       const start = new Date(startDate as string);
  //       const end = new Date(endDate as string);
  //       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  //          res.status(400).json({ message: "Invalid start or end date format" });
  //       }
  //       filter.eventDate = { $gte: start, $lte: end };
  //     }
  
    
  //     // If type is provided, we only fetch that specific type of data (event, appointment, or class)
  //     if (type) {
  //       let result: any;
  
  //       // Fetch data based on the provided type
  //       if (type === 'event') {
  //         result = await Event.find(filter).populate('staff');  // Fetch Events with the filter
  //       } else if (type === 'appointment') {
  //         result = await Appointment.find(filter).populate('staff contact lead');  // Fetch Appointments with the filter
  //       } else if (type === 'class') {
  //         result = await Class.find(filter);  // Fetch Classes with the filter (assuming class model exists)
  //       } else {
  //          res.status(400).json({ message: "Invalid type specified. Choose between 'event', 'appointment', or 'class'" });
  //         return;
  //       }
        
  
  //        res.status(200).json({
  //         success: true,
  //         message: `${type.charAt(0).toUpperCase() + type.slice(1)} data fetched successfully.`,
  //         data: result
  //       });
  //     }
  
  //     // If no type is provided, return data for all types
  //     const events = await Event.find(filter).populate('staff');  // Fetch Events with the filter
  //     const appointments = await Appointment.find(filter).populate('staff contact lead');  // Fetch Appointments with the filter
  //     const classes = await Class.find(filter)
  //     .populate('class', 'name');
  
  //     // Prepare the response data
  //     const result = {
  //       events,
  //       appointments,
  //       classes
  //     };
  
  //     // Respond with filtered data for all types
  //      res.status(200).json({
  //       success: true,
  //       message: 'Filtered data fetched successfully.',
  //       data: result
  //     });
  //   } catch (error) {
  //     console.error("Error fetching data:", error);  // Log error for debugging
  //      res.status(500).json({ message: 'Error fetching filtered data', error: error });
  //   }
  // };


  export const getFilteredData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract query parameters for filtering
      const { type, staffId, locationName, className, service, date, startDate, endDate } = req.query;
  
      // Prepare filter object for appointments, events, and classes
      const filter: any = {};
  
      // Filter by staffId if provided
      if (staffId) {
        filter.staff = staffId;
      }
  
      // Filter by locationName if provided
      if (locationName) {
        filter.locationName = locationName;
      }
  
      // Filter by className if provided (for Event or Class models)
      if (className) {
        filter.name = className; // Assuming 'name' is the class name in your schema
      }
  
      // Filter by service if provided (for Appointment model)
      if (service) {
        filter.service = service;
      }
  
      // Filter by date if provided (for Event and Appointment models)
      if (date) {
        const eventDate = new Date(date as string);
        if (isNaN(eventDate.getTime())) {
          res.status(400).json({ message: "Invalid date format" });
          return;
        }
        filter.eventDate = eventDate;
      }
  
      // Filter by startDate and endDate for range filtering
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          res.status(400).json({ message: "Invalid start or end date format" });
          return;
        }
        filter.eventDate = { $gte: start, $lte: end };
      }
  
      // If type is provided, we only fetch that specific type of data (event, appointment, or class)
      if (type) {
        let result: any;
  
        // Fetch data based on the provided type
        if (type === 'event') {
          result = await Event.find(filter).populate('staff');  // Fetch Events with the filter
        } else if (type === 'appointment') {
          result = await Appointment.find(filter).populate('staff contact lead');  // Fetch Appointments with the filter
        } else if (type === 'class') {
          result = await Class.find(filter)
            .populate('staff')  // Populate staff reference
            .populate('location')  // Populate location reference
            .populate('lead');  // Populate lead reference
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
  
      // If no type is provided, return data for all types
      const events = await Event.find(filter).populate('staff');  // Fetch Events with the filter
      const appointments = await Appointment.find(filter).populate('staff contact lead');  // Fetch Appointments with the filter
      const classes = await Class.find(filter)
        .populate('staff')  // Populate staff reference
        .populate('location')  // Populate location reference
        .populate('lead');  // Populate lead reference
  
      // Prepare the response data
      const result = {
        events,
        appointments,
        classes
      };
  
      // Respond with filtered data for all types
      res.status(200).json({
        success: true,
        message: 'Filtered data fetched successfully.',
        data: result
      });
    } catch (error) {
      console.error("Error fetching data:", error);  // Log error for debugging
      res.status(500).json({ message: 'Error fetching filtered data', error: error });
    }
  };
  