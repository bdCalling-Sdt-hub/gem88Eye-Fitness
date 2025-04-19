import { Request, Response, NextFunction } from 'express';
import { AppointmentRequestBody } from '../../../types/appointment';  
import mongoose, { ObjectId } from 'mongoose';  
import Appointment from './appoinment.model';
import Client from './client.model';            
import Staff from '../staff/staff.model';             
import Lead from './leads.model';     

import { scheduleNotification } from '../../../util/scheduleNotification';
// import  io  from '../../../helpers/socketHelper ';
import Notification from '../notification/notification.model';
import Admin from '../Admin/admin.model';
import moment from 'moment';



// export const bookAppointment = async (
//   req: Request<{}, {}, AppointmentRequestBody>,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { contactName, service, staffId, leadId, date, time } = req.body;

//   if (!contactName || !service || !staffId || !leadId || !date || !time) {
//     res.status(400).json({ success: false, message: 'All fields are required!' });
//     return;
//   }

//   try {
//     const client = await Client.findOne({ client_name: contactName });
//     const staff = await Staff.findById(staffId);
//     const lead = await Lead.findById(leadId);

//     if (!client || !staff || !lead) {
//       res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
//       return;
//     }

//     const appointmentDateTime = new Date(`${date}T${time}`);
//     if (isNaN(appointmentDateTime.getTime())) {
//       res.status(400).json({ success: false, message: 'Invalid date or time format' });
//       return;
//     }

//     // Determine the status based on the appointment date and time
//     const status = moment(appointmentDateTime).isBefore(moment()) ? 'completed' : 'upcoming';

//     const newAppointment = new Appointment({
//       contact: client._id,
//       service,
//       staff: staff._id,
//       lead: lead._id,
//       date,
//       time,
//       status, // Add status here
//     });

//     await newAppointment.save();

//     // Create notifications for the staff and client
//     const notificationMessage = `You have a new appointment for ${service}`;
//     const notificationDate = new Date(appointmentDateTime);

//     const notificationData = [
//       { userId: client._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Appointment' },
//       { userId: staff._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Appointment' }
//     ];

//     await Notification.insertMany(notificationData);

//     // Schedule notifications 1 day before and 1 hour before
//     const io = req.app.get('io');
//     const times = [
//       new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
//       new Date(appointmentDateTime.getTime() - 60 * 60 * 1000), // 1 hour before
//     ];

//     // Client reminder notifications
//     scheduleNotification(
//       client._id as string,
//       `Reminder: Appointment for ${service}`,
//       times,
//       'Appointment',
//       io,
//       'Admin'
//     );

//     // Staff reminder notifications
//     scheduleNotification(
//       staff._id as string,
//       `Reminder: You have an appointment for ${service} with ${contactName}`,
//       times,
//       'Appointment',
//       io,
//       'Staff'
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Appointment booked and notifications sent!',
//       data: newAppointment,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const bookAppointment = async (
//   req: Request<{}, {}, AppointmentRequestBody>,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { contactName, service, staffId, leadId, date, time } = req.body;

//   if (!contactName || !service || !staffId || !leadId || !date || !time) {
//     res.status(400).json({ success: false, message: 'All fields are required!' });
//     return;
//   }

//   try {
//     const client = await Client.findOne({ client_name: contactName });
//     const staff = await Staff.findById(staffId);
//     const lead = await Lead.findById(leadId);

//     if (!client || !staff || !lead) {
//       res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
//       return;
//     }

//     const appointmentDateTime = new Date(`${date}T${time}`);
//     if (isNaN(appointmentDateTime.getTime())) {
//       res.status(400).json({ success: false, message: 'Invalid date or time format' });
//       return;
//     }

//     // Determine the status based on the appointment date and time
//     const status = moment(appointmentDateTime).isBefore(moment()) ? 'completed' : 'upcoming';

//     const newAppointment = new Appointment({
//       contact: client._id,
//       service,
//       staff: staff._id,
//       lead: lead._id,
//       date,
//       time,
//       status, // Add status here
//     });

//     await newAppointment.save();

//     // Create notifications for the staff, client, and lead
//     const notificationMessage = `You have a new appointment for ${service}`;
//     const notificationDate = new Date(appointmentDateTime);

//     const notificationData = [
//       { userId: client._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Appointment' },
//       { userId: staff._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Appointment' },
//       { userId: lead._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Appointment' }
//     ];

//     await Notification.insertMany(notificationData);

//     // Schedule notifications 1 day before and 1 hour before
//     const io = req.app.get('io');
//     const times = [
//       new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
//       new Date(appointmentDateTime.getTime() - 60 * 60 * 1000), // 1 hour before
//     ];

//     // Client reminder notifications
//     scheduleNotification(
//       client._id as string,
//       `Reminder: Appointment for ${service}`,
//       times,
//       'Appointment',
//       io,
//       'Admin'
//     );

//     // Staff reminder notifications
//     scheduleNotification(
//       staff._id as string,
//       `Reminder: You have an appointment for ${service} with ${contactName}`,
//       times,
//       'Appointment',
//       io,
//       'Staff'
//     );

//     // Optionally, create admin notifications
//     const adminNotificationMessage = `A new appointment for ${service} has been booked with client ${contactName}`;
//     const adminNotificationData = {
//       userId: 'admin-id', // Replace with the actual admin ID
//       message: adminNotificationMessage,
//       scheduledTime: notificationDate,
//       type: 'Appointment'
//     };
    
//     await Notification.create(adminNotificationData);

//     res.status(201).json({
//       success: true,
//       message: 'Appointment booked and notifications sent!',
//       data: newAppointment,
//     });
//   } catch (err) {
//     next(err);
//   }
// };



export const bookAppointment = async (
  req: Request<{}, {}, AppointmentRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { contactName, service, staffId, leadId, date, time } = req.body;
  if (!contactName || !service || !staffId || !leadId || !date || !time) {
    res.status(400).json({ success: false, message: 'All fields are required!' });
    return;
  }
  
  try {
    const client = await Client.findOne({ client_name: contactName });
    const staff = await Staff.findById(staffId);
    const lead = await Lead.findById(leadId);
    
    if (!client || !staff || !lead) {
      res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
      return;
    }
    
    const appointmentDateTime = new Date(`${date}T${time}`);
    if (isNaN(appointmentDateTime.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid date or time format' });
      return;
    }
    
    const status = moment(appointmentDateTime).isBefore(moment()) ? 'completed' : 'upcoming';
    
    const newAppointment = new Appointment({
      contact: client._id,
      service,
      staff: staff._id,
      lead: lead._id,
      date,
      time,
      status,
    });
    
    await newAppointment.save();
    
    createAdminNotifications(
      service,
      'Appointment',
      appointmentDateTime,
      req.app.get('io') 
    );
    
    const notificationMessage = `You have a new appointment for ${service}`;
    
    const clientNotification = scheduleNotification(
      (client._id as mongoose.Types.ObjectId).toString(),
      notificationMessage,
      new Date(),
      'Appointment',
      req.app.get('io'),
      true
    );
    
    const staffNotification = scheduleNotification(
      (staff._id as mongoose.Types.ObjectId).toString(),
      notificationMessage,
      new Date(),
      'Appointment',
      req.app.get('io'),
      true
    );
    
    const leadNotification = scheduleNotification(
      (lead._id as mongoose.Types.ObjectId).toString(),
      notificationMessage,
      new Date(),
      'Appointment',
      req.app.get('io'),
      
    );
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked and notifications sent!',
      data: newAppointment,
    });
  } catch (err) {
    next(err);
  }
};
const createAdminNotifications = async (appointment: any, p0: string, appointmentDateTime: Date, p1: any) => {
  try {
    const admins = await Admin.find();

    const notificationMessage = `A new appointment has been booked for service: ${appointment.service} with client: ${appointment.contact.name}`;
    const notificationDate = new Date();

    const notificationData = admins.map(admin => ({
      userId: admin._id,
      message: notificationMessage,
      scheduledTime: notificationDate,
      type: 'Appointment'
    }));

    await Notification.insertMany(notificationData);
  } catch (err) {
    console.error('Error creating admin notifications:', err);
    throw new Error('Error creating admin notifications');
  }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { appointmentId } = req.params;  // Get appointmentId from URL parameters
  const { contactName, service, staffId, leadId, date, time } = req.body;

  try {
    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId);

    // If appointment not found, return a 404 error
    if (!appointment) {
       res.status(404).json({ success: false, message: 'Appointment not found!' });
        return
    }

    // Fetch the contact (Client), staff, and lead for validation
    const client = await Client.findOne({ client_name: contactName });
    const staff = await Staff.findById(staffId);
    const lead = await Lead.findById(leadId);

    if (!client || !staff || !lead) {
       res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
        return
    }

    // Update the fields with the provided values
    if (contactName) appointment.contact = client._id as mongoose.Types.ObjectId; // Explicit cast to ObjectId
    if (service) appointment.service = service;
    if (staffId) appointment.staff = staff._id as mongoose.Types.ObjectId;  // Explicit cast to ObjectId
    if (leadId) appointment.lead = lead._id as mongoose.Types.ObjectId;    // Explicit cast to ObjectId
    if (date) appointment.date = date;
    if (time) appointment.time = time;

    // Save the updated appointment
    await appointment.save();

    // Return the updated appointment
    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully!',
      data: appointment,
    });
  } catch (err) {
    next(err);  // Pass error to the global error handler
  }
};


export const getAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch all appointments and populate associated client, staff, and lead details
      const appointments = await Appointment.find()
        .populate('contact')  
        .populate('staff')  
        .populate('lead');   
  
      if (!appointments || appointments.length === 0) {
        res.status(404).json({ success: false, message: 'No appointments found' });
        return;
      }
  
      res.status(200).json({
        success: true,
        message: 'Appointments fetched successfully',
        data: appointments
      });
    } catch (err) {
      next(err);
    }
  };
  
 
  export const getAppointmentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filter, status } = req.query;  
      const filterQuery: any = {};
  

      if (filter) {
        const regex = { $regex: filter, $options: 'i' }; //case insensitive
  
        filterQuery['$or'] = [
          { 'staff.name': regex },
          { 'contact.contactName': regex }, 
          { service: regex },
          { date: regex },
          { time: regex }
        ];
      }
  
      // Fetch all appointments based on the constructed filter query
      const allAppointments = await Appointment.find(filterQuery)
        .populate('staff', 'name')
        .populate('contact', 'contactName')  
        .populate('lead', 'leadName')  
        .exec();
  
      if (!allAppointments || allAppointments.length === 0) {
       res.status(404).json({
          success: false,
          message: 'No appointments found.',
        });
      }
  
      const currentDateTime = moment();
  
      let completedAppointmentsCount = 0;
      let upcomingAppointmentsCount = 0;
  
      const categorizedAppointments = allAppointments.map((appointment) => {
        const appointmentDateTime = moment(`${appointment.date}T${appointment.time}`);
  
        const appointmentStatus = appointmentDateTime.isBefore(currentDateTime) ? 'completed' : 'upcoming';
  
        if (appointmentStatus === 'completed') {
          completedAppointmentsCount++;
        } else {
          upcomingAppointmentsCount++;
        }
  
        return {
          ...appointment.toObject(),
          status: appointmentStatus,
        };
      });
  
      if (status) {
        const filteredAppointments = categorizedAppointments.filter(
          (appointment) => appointment.status === status
        );
  
         res.status(200).json({
          success: true,
          message: `Appointment statistics fetched successfully for status: ${status}`,
          data: {
            totalAppointments: filteredAppointments.length,
            completedAppointments: status === 'completed' ? filteredAppointments.length : completedAppointmentsCount,
            upcomingAppointments: status === 'upcoming' ? filteredAppointments.length : upcomingAppointmentsCount,
            appointments: filteredAppointments,
          },
        });
      }
  
       res.status(200).json({
        success: true,
        message: 'Appointment statistics fetched successfully.',
        data: {
          totalAppointments: allAppointments.length,
          completedAppointments: completedAppointmentsCount,
          upcomingAppointments: upcomingAppointmentsCount,
          appointments: categorizedAppointments,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  

  export const deleteAppoinment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const appointmentId = req.params.id;  // Get the client ID from the URL
  
    try {
      // Try to find and remove the client by ID
      const deletedAppoinment = await Appointment.findByIdAndDelete(appointmentId);
  
      // If the client is not found
      if (!appointmentId) {
         res.status(404).json({
          success: false,
          message: 'Appoinment not found'
        });
      }
  
      // Return success message
      res.status(200).json({
        success: true,
        message: 'Appoinment deleted successfully!',
        data: deletedAppoinment
      });
    } catch (err) {
      next(err); // Pass the error to the global error handler
    }
  };



