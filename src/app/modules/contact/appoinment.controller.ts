import { Request, Response, NextFunction } from 'express';
import { AppointmentRequestBody } from '../../../types/appointment';  // Import the interface for request body
import Appointment from './appoinment.model';  // Import Appointment model
import Client from './client.model';            // Import Client model
import Staff from '../staff/staff.model';              // Import Staff model
import Lead from './leads.model';                // Import Lead model

// Controller to book an appointment
export const bookAppointment = async (req: Request<{}, {}, AppointmentRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  const { contactName, service, staffId, leadId, date, time } = req.body;

  if (!contactName || !service || !staffId || !leadId || !date || !time) {
     res.status(400).json({ success: false, message: 'All fields are required!' });
     return
  }

  try {
    // Fetch the contact (Client), staff, and lead
    const client = await Client.findOne({ client_name: contactName });
    const staff = await Staff.findById(staffId);
    const lead = await Lead.findById(leadId);

    if (!client || !staff || !lead) {
       res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
       return
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

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: newAppointment
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