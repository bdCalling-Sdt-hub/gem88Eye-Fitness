import { Request, Response, NextFunction } from 'express';
import { AppointmentRequestBody } from '../../../types/appointment';  // Import the interface for request body
import mongoose, { ObjectId } from 'mongoose';  // Import ObjectId from mongoose
import Appointment from './appoinment.model';  // Import Appointment model
import Client from './client.model';            // Import Client model
import Staff from '../staff/staff.model';              // Import Staff model
import Lead from './leads.model';                // Import Lead model
import { scheduleNotification } from '../../../util/scheduleNotification';

// Controller to book an appointment
// export const bookAppointment = async (req: Request<{}, {}, AppointmentRequestBody>, res: Response, next: NextFunction): Promise<void> => {
//   const { contactName, service, staffId, leadId, date, time } = req.body;

//   if (!contactName || !service || !staffId || !leadId || !date || !time) {
//      res.status(400).json({ success: false, message: 'All fields are required!' });
//      return
//   }

//   try {
//     // Fetch the contact (Client), staff, and lead
//     const client = await Client.findOne({ client_name: contactName });
//     const staff = await Staff.findById(staffId);
//     const lead = await Lead.findById(leadId);

//     if (!client || !staff || !lead) {
//        res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
//        return
//     }

//     // Create a new appointment
//     const newAppointment = new Appointment({
//       contact: client._id,
//       service,
//       staff: staff._id,
//       lead: lead._id,
//       date,
//       time,
//     });

//     await newAppointment.save();

//     const io = req.app.get('io');
// const appointmentDateTime = new Date(`${date}T${time}`);
// const times = [
//   new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
//   new Date(appointmentDateTime.getTime() - 60 * 60 * 1000),       // 1 hour before
// ];

// scheduleNotification(client._id as string, `Reminder: Appointment for ${service}`, times, 'Appointment', io);


//     res.status(201).json({
//       success: true,
//       message: 'Appointment booked successfully!',
//       data: newAppointment
//     });
//   } catch (err) {
//     next(err);  // Pass error to the global error handler
//   }
// };
export const bookAppointment = async (
  req: Request<{}, {}, AppointmentRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { contactName, service, staffId, leadId, date, time } = req.body;

  if (!contactName || !service || !staffId || !leadId || !date || !time) {
    res
      .status(400)
      .json({ success: false, message: 'All fields are required!' });
    return;
  }

  try {
    // Fetch the contact (Client), staff, and lead
    const client = await Client.findOne({ client_name: contactName });
    const staff = await Staff.findById(staffId);
    const lead = await Lead.findById(leadId);

    if (!client || !staff || !lead) {
      res
        .status(404)
        .json({ success: false, message: 'Client, Staff, or Lead not found' });
      return;
    }

    // Safely build the appointment datetime
    const appointmentDateTime = new Date(`${date}T${time}`);
    if (isNaN(appointmentDateTime.getTime())) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid date or time format' });
      return;
    }

    // Create a new appointment
    const newAppointment = new Appointment({
      contact: client._id,
      service,
      staff: staff._id,
      lead: lead._id,
      date,
      time,
    });

    await newAppointment.save();

    // Schedule notifications for both client and staff
    const io = req.app.get('io');
    const times = [
      new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      new Date(appointmentDateTime.getTime() - 60 * 60 * 1000), // 1 hour before
    ];

    // Client notification
    scheduleNotification(
      client._id as string,
      `Reminder: Appointment for ${service}`,
      times,
      'Appointment',
      io,
      'Admin' 
    );

    // Staff notification
    scheduleNotification(
      staff._id as string,
      `Reminder: You have an appointment for ${service} with ${contactName}`,
      times,
      'Appointment',
      io,
      'Staff'
    );

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: newAppointment,
    });
  } catch (err) {
    next(err);
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
        .populate('contact')  // Populate client details
        .populate('staff')    // Populate staff details
        .populate('lead');    // Populate lead details
  
      if (!appointments || appointments.length === 0) {
        res.status(404).json({ success: false, message: 'No appointments found' });
        return;
      }
  
      // Return the list of appointments along with populated client, staff, and lead data
      res.status(200).json({
        success: true,
        message: 'Appointments fetched successfully',
        data: appointments
      });
    } catch (err) {
      // Pass any error that occurs to the global error handler
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


