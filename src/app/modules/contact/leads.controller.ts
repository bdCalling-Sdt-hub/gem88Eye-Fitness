
import { Request, Response, NextFunction } from 'express';
import Lead from './leads.model'; 
import csvParser from 'csv-parser';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import fs from 'fs'; 
import { ObjectId } from 'mongoose';
import Appointment from './appoinment.model';
import { emailHelper } from '../../../helpers/emailHelper';
import Class from '../class/class.model';
const uploadCSV = fileUploadHandler(); 


export const addLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, companyName,lead_email, address, gender, phone, staff, lead, note } = req.body;

  if (!name || !lead_email || !address || !gender || !phone) {
    res.status(400).json({ success: false, message: 'All fields are required!' });
    return;
  }

  try {
    const newLead = new Lead({
      name,
      companyName,
      lead_email,
      address,
      gender,
      phone,
      staff,  
      lead,
      note,
    });

    await newLead.save();

    res.status(201).json({
      success: true,
      message: 'Lead added successfully!',
      data: newLead,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLeadsFromCsv = (req: Request, res: Response, next: NextFunction): void => {
  uploadCSV(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'File upload failed',
        error: err.message,
      });
    }

    const uploadedFile = (req as any).files['documents'][0]; 
    const filePath = uploadedFile.path;

    const leadsData: any[] = [];
    const leadsExist: any[] = []; 

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', async (row) => {
        const { name, lead_email, address, gender, phone } = row;

        if (name && lead_email && address && gender && phone) {
          try {
            const existingLead = await Lead.findOne({ lead_email });

            if (existingLead) {
              const updatedLead = await Lead.findOneAndUpdate(
                { lead_email },
                { name, address, gender, phone },
                { new: true }
              );
              leadsData.push(updatedLead); 
              leadsExist.push(updatedLead); 
            } else {
              const newLead = new Lead({
                name,
                lead_email,
                address,
                gender,
                phone,
              });
              await newLead.save();
              leadsData.push(newLead); 
            }
          } catch (error) {
            console.error(`Error processing lead with email ${lead_email}:`, error);
          }
        }
      })
      .on('end', () => {
        fs.unlinkSync(filePath);

        const message = leadsExist.length > 0
          ? `Leads updated successfully from CSV! ${leadsExist.length} leads were updated.`
          : 'Leads updated successfully from CSV! All new leads were created.';

        res.status(200).json({
          success: true,
          message: message,
          data: leadsData, 
        });
      })
      .on('error', (error) => {
        fs.unlinkSync(filePath); 
        return res.status(500).json({
          success: false,
          message: 'Error while parsing CSV',
          error: error.message,
        });
      });
  });
};
export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { leadId } = req.params; 
  const { name, companyName,lead_email, address, gender, phone, staff, lead, note } = req.body;

  try {

    const leadToUpdate = await Lead.findById(leadId);
    if (!leadToUpdate) {
       res.status(404).json({ success: false, message: 'Lead not found!' });
       return
    }
    if (name) leadToUpdate.name = name;
    if (lead_email) leadToUpdate.lead_email = lead_email;
    if (address) leadToUpdate.address = address;
    if (gender) leadToUpdate.gender = gender;
    if (phone) leadToUpdate.phone = phone;
    if (staff) leadToUpdate.staff = staff; 
    if (lead) leadToUpdate.lead = lead;   
    if (note) leadToUpdate.note = note;
    if (companyName) leadToUpdate.companyName = companyName;

    await leadToUpdate.save();


    res.status(200).json({
      success: true,
      message: 'Lead updated successfully!',
      data: leadToUpdate,
    });
  } catch (err) {
    next(err);  
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { leadId } = req.params;
  const { filter } = req.query;

  try {
    // Fetch the lead by ID
    const lead = await Lead.findById(leadId)
      .populate('staff', 'name') 
      .populate('lead', 'name');

    // If lead not found, return error response
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    // Fetch appointments and classes, even if no data is associated
    const appointments = await Appointment.find({ lead: leadId })
      .populate('staff', 'name')
      .populate('lead', 'name');

    const classes = await Class.find({ lead: leadId })
      .populate('staff', 'name')
      .populate('lead', 'name')
      .populate('schedule', 'date');

    const currentDate = new Date();

    // Filtering logic based on the filter query
    let filteredAppointments = appointments;
    let filteredClasses = classes;

    if (filter) {
      if (filter === 'upcoming') {
        filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) > currentDate);
        filteredClasses = classes.filter((classItem) => {
          return classItem.schedule.some(session => new Date(session.date) > currentDate);
        });
      } else if (filter === 'past') {
        filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) <= currentDate);
        filteredClasses = classes.filter((classItem) => {
          return classItem.schedule.every(session => new Date(session.date) <= currentDate);
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid filter type. Use "upcoming" or "past".',
        });
        return;
      }
    }

    // Prepare the response data, showing the lead with empty arrays if no appointments or classes
    const responseData = {
      lead,
      upcomingAppointments: filteredAppointments.length > 0 ? filteredAppointments : [],
      pastAppointments: filteredAppointments.length > 0 ? filteredAppointments : [],
      upcomingClasses: filteredClasses.length > 0 ? filteredClasses : [],
      pastClasses: filteredClasses.length > 0 ? filteredClasses : [],
    };

    // Send response, without error about missing appointments/classes
    res.status(200).json({
      success: true,
      message: 'Lead profile with filtered appointments and classes retrieved successfully',
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
};


export const sendEmailToLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { leadId, subject, html } = req.body; 

  try {
    const lead = await Lead.findById(leadId);

    if (!lead) {
       res.status(404).json({ success: false, message: 'Lead not found' });
       return;
    }

    await emailHelper.sendEmail({
      to: lead.lead_email,
      subject,
      html,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${lead.lead_email}`,
    });
  } catch (err) {
    next(err); 
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const leadId = req.params.id;  

  try {
    const deletedLead = await Lead.findByIdAndDelete(leadId);


    if (!deletedLead) {
       res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }


    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully!',
      data: deletedLead
    });
  } catch (err) {
    next(err); 
  }
};

export const getAllLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leads = await Lead.find();
    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const leadId = req.params.id; 
  const {active } = req.body; 

  if (typeof active !== 'boolean') {
     res.status(400).json({
      success: false,
      message: 'Active status must be a boolean value (true or false).'
    });
  }

  try {
    const updatedLead = await Lead.findOneAndUpdate(
      { leadId: leadId }, 
      { active },  
      { new: true }  
    );

    if (!updatedLead) {
       res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Lead status updated to ${active ? 'active' : 'inactive'}`,
      data: updatedLead
    });
  } catch (err) {
    next(err);
  }
};
