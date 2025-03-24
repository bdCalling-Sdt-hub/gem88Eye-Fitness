// src/app/controllers/lead.controller.ts
import { Request, Response, NextFunction } from 'express';
import Lead from './leads.model';  // Import Lead model

// Controller to add a lead
export const addLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { lead_name, lead_email, address, gender, phone } = req.body;

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
