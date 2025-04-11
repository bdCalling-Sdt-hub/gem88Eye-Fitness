// src/app/controllers/lead.controller.ts
import { Request, Response, NextFunction } from 'express';
import Lead from './leads.model';  // Import Lead model

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
  const { leadName, active } = req.body;  // Get lead name and active status from the request body

  if (typeof active !== 'boolean') {
     res.status(400).json({
      success: false,
      message: 'Active status must be a boolean value (true or false).'
    });
  }

  try {
    const updatedLead = await Lead.findOneAndUpdate(
      { lead_name: leadName }, 
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
