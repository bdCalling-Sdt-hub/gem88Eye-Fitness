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
    
//     const status = moment(appointmentDateTime).isBefore(moment()) ? 'completed' : 'upcoming';
    
//     const newAppointment = new Appointment({
//       contact: client._id,
//       service,
//       staff: staff._id,
//       lead: lead._id,
//       date,
//       time,
//       status,
//     });
    
//     await newAppointment.save();
    
//     createAdminNotifications(
//       service,
//       'Appointment',
//       appointmentDateTime,
//       req.app.get('io') 
//     );
    
//     const notificationMessage = `You have a new appointment for ${service}`;
    
//     const clientNotification = scheduleNotification(
//       (client._id as mongoose.Types.ObjectId).toString(),
//       notificationMessage,
//       new Date(),
//       'Appointment',
//       req.app.get('io'),
//       true
//     );
    
//     const staffNotification = scheduleNotification(
//       (staff._id as mongoose.Types.ObjectId).toString(),
//       notificationMessage,
//       new Date(),
//       'Appointment',
//       req.app.get('io'),
//       true
//     );
    
//     const leadNotification = scheduleNotification(
//       (lead._id as mongoose.Types.ObjectId).toString(),
//       notificationMessage,
//       new Date(),
//       'Appointment',
//       req.app.get('io'),
      
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
    const client = await Client.findOne({ name: contactName });
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
      {
        service: service,         
        lead: (lead.name as string) || (lead._id as mongoose.Types.ObjectId).toString()
      },
      'Appointment',
      appointmentDateTime,
      req.app.get('io')
    );
    
    
    const notificationMessage = `You have a new appointment for ${service}`;

    res.status(201).json({
      success: true,
      message: 'Appointment booked and notifications sent!',
      data: newAppointment,
    });
  } catch (err) {
    next(err);
  }
};

const createAdminNotifications = async (
  appointment: { service: string; lead: string },
  type: string,
  appointmentDateTime: Date,
  io: any
) => {
  try {
    const admins = await Admin.find();

    const notificationMessage = `A new appointment has been booked for service: ${appointment.service} with lead: ${appointment.lead}`;

    const notificationDate = new Date();

    const notificationData = admins.map(admin => ({
      userId: admin._id,
      userModel: 'Admin',
      message: notificationMessage,
      scheduledTime: notificationDate,
      type: type,
      isRead: false,
      isSent: false
    }));

    await Notification.insertMany(notificationData);

  } catch (err) {
    console.error('Error creating admin notifications:', err);
    throw new Error('Error creating admin notifications');
  }
};


export const updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { appointmentId } = req.params;  
  const { contactName, service, staffId, leadId, date, time } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
       res.status(404).json({ success: false, message: 'Appointment not found!' });
        return
    }

    const client = await Client.findOne({name: contactName});
    const staff = await Staff.findById(staffId);
    const lead = await Lead.findById(leadId);

    if (!client || !staff || !lead) {
       res.status(404).json({ success: false, message: 'Client, Staff, or Lead not found' });
        return
    }

    if (contactName) appointment.contact = client._id as mongoose.Types.ObjectId;
    if (service) appointment.service = service;
    if (staffId) appointment.staff = staff._id as mongoose.Types.ObjectId;  
    if (leadId) appointment.lead = lead._id as mongoose.Types.ObjectId;    
    if (date) appointment.date = date;
    if (time) appointment.time = time;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully!',
      data: appointment,
    });
  } catch (err) {
    next(err);  
  }
};

export const getAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointments = await Appointment.find()
      .populate('contact')  
      .populate('staff')  
      .populate('lead');   

    if (!appointments || appointments.length === 0) {
      res.status(404).json({ success: false, message: 'No appointments found' });
      return;
    }

    const today = moment().startOf('day'); 
    const updatedAppointments = appointments.map(appointment => {
      const appointmentDate = moment(appointment.date);
      let status = 'Upcoming'; 

      if (appointmentDate.isBefore(today, 'day')) {
        status = 'Completed'; 
      } else if (appointmentDate.isSame(today, 'day')) {
        status = 'Today'; 
      }

      return {
        ...appointment.toObject(),
        status  
      };
    });

    res.status(200).json({
      success: true,
      message: 'Appointments fetched successfully',
      data: updatedAppointments
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
        const regex = { $regex: filter, $options: 'i' }; 
  
        filterQuery['$or'] = [
          { 'staff.name': regex },
          { 'contact.name': regex }, 
          { 'lead.name': regex },
          { 'location.locationName': regex },         
          { service: regex },
          { date: regex },
          { time: regex }
        ];
      }
  
      const allAppointments = await Appointment.find(filterQuery)
        .populate('staff', 'name')
        .populate('contact', 'name')  
        .populate('lead', 'name')  
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
    const appointmentId = req.params.id;  
  
    try {
      const deletedAppoinment = await Appointment.findByIdAndDelete(appointmentId);
  
      if (!appointmentId) {
         res.status(404).json({
          success: false,
          message: 'Appoinment not found'
        });
      }
  

      res.status(200).json({
        success: true,
        message: 'Appoinment deleted successfully!',
        data: deletedAppoinment
      });
    } catch (err) {
      next(err);
    }
  };



