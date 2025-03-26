import { Request, Response, NextFunction } from 'express';
import Appointment from './appoinment.model';  // Assuming your Appointment model is located here
import Client from '../contact/client.model';  // Assuming your Client model is located here
import Staff from '../staff/staff.model';    // Assuming your Staff model is located here
import Lead from '../contact/leads.model';      // Assuming your Lead model is located here

// Book an appointment
export const bookAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { clientId, service, staffId, leadId, date, time } = req.body;

  // Ensure all fields are provided
  if (!clientId || !service || !staffId || !leadId || !date || !time) {
    res.status(400).json({ success: false, message: 'All fields are required!' });
    return;
  }

  try {
    // Fetch the client (Client), staff, and lead
    const client = await Client.findById(clientId); // Use clientId instead of contactName
    const staff = await Staff.findById(staffId);
    const lead = await Lead.findById(leadId);

    // Check if client, staff, or lead were not found
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
    console.error('Error during appointment booking:', err);
    next(err);  // Pass error to the global error handler
  }
};
export const getAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch all appointments from the database
      const appointments = await Appointment.find()
        .populate('contact')  // Populate the contact field (Client)
        .populate('staff')    // Populate the staff field
        .populate('lead');    // Populate the lead field
  
      // If no appointments are found
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
      next(err);  // Pass error to the global error handler
    }
  };