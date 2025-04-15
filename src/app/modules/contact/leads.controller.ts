// src/app/controllers/lead.controller.ts
import { Request, Response, NextFunction } from 'express';
import Lead from './leads.model';  // Import Lead model
import csvParser from 'csv-parser';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import fs from 'fs';  // Import file system module for file operations
import { ObjectId } from 'mongoose';  // Import ObjectId type from mongoose
import Appointment from './appoinment.model';
import { emailHelper } from '../../../helpers/emailHelper';
import Class from '../class/class.model';
// Controller to add a lead
export const addLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { lead_name, lead_email, address, gender, phone, staff, lead } = req.body;

  // Validation for required fields (lead_name, lead_email, address, gender, phone)
  if (!lead_name || !lead_email || !address || !gender || !phone) {
    res.status(400).json({ success: false, message: 'All fields are required!' });
    return;
  }

  try {
    const newLead = new Lead({
      lead_name,
      lead_email,
      address,
      gender,
      phone,
      staff,  // Optional field, no error if not provided
      lead    // Optional field, no error if not provided
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

const uploadCSV = fileUploadHandler();  // This is the multer upload handler you created

// export const updateLeadsFromCsv = (req: Request, res: Response, next: NextFunction): void => {
//   uploadCSV(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({
//         success: false,
//         message: 'File upload failed',
//         error: err.message,
//       });
//     }


//     const uploadedFile = (req as any).files['documents'][0]; 
//     const filePath = uploadedFile.path;

//     const leadsData: any[] = [];

//     fs.createReadStream(filePath)
//       .pipe(csvParser())
//       .on('data', async (row) => {
//         const { lead_name, lead_email, address, gender, phone} = row;

//         if (lead_name && lead_email && address && gender && phone) {
     
//           const updatedLead = await Lead.findOneAndUpdate(
//             { lead_email },
//             { lead_name, address, gender, phone},
//             { new: true, upsert: true }
//           );
//           leadsData.push(updatedLead);
//         }
//       })
//       .on('end', () => {
//         fs.unlinkSync(filePath);

//         res.status(200).json({
//           success: true,
//           message: 'Leads updated successfully from CSV!',
//           data: leadsData,
//         });
//       })
//       .on('error', (error) => {

//         fs.unlinkSync(filePath);
//         return res.status(500).json({
//           success: false,
//           message: 'Error while parsing CSV',
//           error: error.message,
//         });
//       });
//   });
// };
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
    const leadsExist: any[] = [];  // To store the leads that already exist

    // Start reading and processing the CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', async (row) => {
        const { lead_name, lead_email, address, gender, phone } = row;

        // Check if all required fields are present
        if (lead_name && lead_email && address && gender && phone) {
          try {
            // Check if the lead already exists using the lead_email
            const existingLead = await Lead.findOne({ lead_email });

            if (existingLead) {
              // If the lead exists, log that the lead is already present
              console.log(`Lead with email ${lead_email} already exists. Updating the lead.`);

              // Update the existing lead
              const updatedLead = await Lead.findOneAndUpdate(
                { lead_email },
                { lead_name, address, gender, phone },
                { new: true }
              );
              leadsData.push(updatedLead);  // Add updated lead to leadsData array
              leadsExist.push(updatedLead); // Add to leadsExist array to track updated leads
            } else {
              // If the lead doesn't exist, create a new lead
              const newLead = new Lead({
                lead_name,
                lead_email,
                address,
                gender,
                phone,
              });
              await newLead.save();
              leadsData.push(newLead);  // Add new lead to leadsData array
            }
          } catch (error) {
            // Handle error during lead creation or update
            console.error(`Error processing lead with email ${lead_email}:`, error);
          }
        }
      })
      .on('end', () => {
        // Delete the uploaded CSV file after processing
        fs.unlinkSync(filePath);

        // Construct appropriate response message based on leads
        const message = leadsExist.length > 0
          ? `Leads updated successfully from CSV! ${leadsExist.length} leads were updated.`
          : 'Leads updated successfully from CSV! All new leads were created.';

        // Send response with the data of updated or created leads
        res.status(200).json({
          success: true,
          message: message,
          data: leadsData,  // Include both created and updated leads
        });
      })
      .on('error', (error) => {
        // Handle any error while reading or parsing the CSV
        fs.unlinkSync(filePath);  // Clean up the file
        return res.status(500).json({
          success: false,
          message: 'Error while parsing CSV',
          error: error.message,
        });
      });
  });
};
export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { leadId } = req.params;  // Assuming the lead ID is passed in the URL parameters
  const { lead_name, lead_email, address, gender, phone, staff, lead } = req.body;

  try {
    // Find the lead by ID
    const leadToUpdate = await Lead.findById(leadId);

    // If the lead is not found, return a 404 error
    if (!leadToUpdate) {
       res.status(404).json({ success: false, message: 'Lead not found!' });
       return
    }

    // Only update fields that are provided in the request body
    if (lead_name) leadToUpdate.lead_name = lead_name;
    if (lead_email) leadToUpdate.lead_email = lead_email;
    if (address) leadToUpdate.address = address;
    if (gender) leadToUpdate.gender = gender;
    if (phone) leadToUpdate.phone = phone;
    if (staff) leadToUpdate.staff = staff;  // Optional: Update staff ID if provided
    if (lead) leadToUpdate.lead = lead;    // Optional: Update lead ID if provided

    // Save the updated lead
    await leadToUpdate.save();

    // Return the updated lead
    res.status(200).json({
      success: true,
      message: 'Lead updated successfully!',
      data: leadToUpdate,
    });
  } catch (err) {
    next(err);  // Pass any errors to the global error handler
  }
};

// export const getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { leadId } = req.params; // Extract leadId from URL params
//   const { filter } = req.query; // Get the filter query parameter (upcoming or past)

//   try {
//     // Fetch the lead from the database using the provided leadId
//     const lead = await Lead.findById(leadId)
//       .populate('staff', 'name')  
//       .populate('lead', 'lead_name') 

      

//     // Check if the lead was found
//     if (!lead) {
//       res.status(404).json({ success: false, message: 'Lead not found' });
//       return;
//     }

//     // Fetch the appointments and classes for the lead
//     const appointments = await Appointment.find({ lead: leadId });
//     const classes = await Class.find({ lead: leadId })
//     .populate('lead', 'lead_name')
//     .populate('staff', 'name')
//     .populate('schedule', 'date');

//     if (appointments.length === 0 && classes.length === 0) {
//       res.status(404).json({ success: false, message: 'No appointments or classes found for this lead' });
//       return;
//     }

//     // Get the current date/time for filtering
//     const currentDate = new Date();

//     let filteredAppointments = appointments;
//     let filteredClasses = classes;

//     if (filter) {
//       // Apply filtering based on the "filter" query parameter
//       if (filter === 'upcoming') {
//         filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) > currentDate);
//         filteredClasses = classes.filter((classItem) => new Date(classItem.schedule.date) > currentDate);
//       } else if (filter === 'past') {
//         filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) <= currentDate);
//         filteredClasses = classes.filter((classItem) => new Date(classItem.schedule.date) <= currentDate);
//       } else {
//          res.status(400).json({
//           success: false,
//           message: 'Invalid filter type. Use "upcoming" or "past".',
//         });
//       }
//     } else {
//       filteredAppointments = appointments;
//       filteredClasses = classes;
//     }

//     const responseData = {
//       lead,
//       upcomingAppointments: filteredAppointments,
//       pastAppointments: filteredAppointments,
//       upcomingClasses: filteredClasses,
//       pastClasses: filteredClasses,
//     };

//     res.status(200).json({
//       success: true,
//       message: 'Lead profile with filtered appointments and classes retrieved successfully',
//       data: responseData,
//     });
//   } catch (err) {
//     next(err); 
//   }
// };
export const getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { leadId } = req.params; // Extract leadId from URL params
  const { filter } = req.query;  // Get the filter query parameter (upcoming or past)

  try {
    // Fetch the lead from the database using the provided leadId
    const lead = await Lead.findById(leadId)
      .populate('staff', 'name')  // Populate staff field in lead (staff name)
      .populate('lead', 'lead_name');  // Populate lead field in lead (lead name)

    // Check if the lead was found
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    // Fetch appointments for the lead and populate the staff and lead fields
    const appointments = await Appointment.find({ lead: leadId })
      .populate('staff', 'name')
      .populate('lead', 'lead_name');

    // Fetch classes for the lead and populate the staff, lead, and schedule fields
    const classes = await Class.find({ lead: leadId })
      .populate('staff', 'name')
      .populate('lead', 'lead_name')
      .populate('schedule', 'date');  // Populate schedule.date to access individual session dates

    // If there are no appointments or classes, return a 404 error
    if (appointments.length === 0 && classes.length === 0) {
      res.status(404).json({ success: false, message: 'No appointments or classes found for this lead' });
      return;
    }

    const currentDate = new Date();

    // Initialize filtered arrays for appointments and classes
    let filteredAppointments = appointments;
    let filteredClasses = classes;

    // Apply filtering if the "filter" query parameter is provided
    if (filter) {
      if (filter === 'upcoming') {
        // Filter upcoming appointments based on date
        filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) > currentDate);

        // Filter upcoming classes based on each session's date
        filteredClasses = classes.filter((classItem) => {
          return classItem.schedule.some(session => new Date(session.date) > currentDate);
        });
      } else if (filter === 'past') {
        // Filter past appointments based on date
        filteredAppointments = appointments.filter((appointment) => new Date(appointment.date) <= currentDate);

        // Filter past classes based on each session's date
        filteredClasses = classes.filter((classItem) => {
          return classItem.schedule.every(session => new Date(session.date) <= currentDate);
        });
      } else {
        // Return an error if the filter type is invalid
        res.status(400).json({
          success: false,
          message: 'Invalid filter type. Use "upcoming" or "past".',
        });
        return;
      }
    }

    // Construct the response data
    const responseData = {
      lead,
      upcomingAppointments: filteredAppointments,
      pastAppointments: filteredAppointments,  // Same array for both upcoming and past, just filtered by date
      upcomingClasses: filteredClasses,
      pastClasses: filteredClasses,  // Same array for both upcoming and past, just filtered by date
    };

    // Return the filtered data as the response
    res.status(200).json({
      success: true,
      message: 'Lead profile with filtered appointments and classes retrieved successfully',
      data: responseData,
    });
  } catch (err) {
    next(err);  // Pass any errors to the global error handler
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
  const leadId = req.params.id;  // Get the client ID from the URL

  try {
    const deletedLead = await Lead.findByIdAndDelete(leadId);

    // If the client is not found
    if (!deletedLead) {
       res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Return success message
    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully!',
      data: deletedLead
    });
  } catch (err) {
    next(err); 
  }
};


// Controller to get all leads
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

// Controller to update the active status of a lead
export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const leadId = req.params.id; 
  const {active } = req.body;  // Get lead name and active status from the request body

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
