import { Request, Response, NextFunction } from 'express';
import Class from './class.model';  // Assuming the Class model is located here
import Lead from '../contact/leads.model';
import Staff from '../staff/staff.model';
import  IClass  from '../class/class.model'; // Assuming the Class interface is imported
import { scheduleNotification } from '../../../util/scheduleNotification';
// Fetch all available class names
export const getPredefinedClassNames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fetch only the 'name' field from classes (predefined names)
    const classNames = await Class.find().select('name');

    // Return available class names
    res.status(200).json({
      success: true,
      message: 'Predefined class names fetched successfully.',
      data: classNames
    });
  } catch (err) {
    next(err);  // Pass error to the global error handler
  }
};


export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const {
    name,
    description,
    location,
    schedule,
    totalCapacity,
    frequency,
    workType,
    leadId,       // Added field for the lead
    staffId,      // Added field for the staff
  } = req.body;

  // Validate required fields
  if (!name || !description || !location || !schedule || !totalCapacity || !frequency || !workType || !leadId || !staffId) {
    res.status(400).json({
      success: false,
      message: 'Please provide all required fields (name, description, location, schedule, totalCapacity, frequency, workType, leadId, staffId)',
    });
    return;
  }

  try {
    // Check if class name already exists
    const existingClass = await Class.findOne({ name });

    if (existingClass) {
      res.status(400).json({
        success: false,
        message: 'Class name already exists. Please select an existing class or create a new name.',
      });
      return;
    }

    // Handle Recurrence
    let recurrenceSchedule = [];
    const initialClassDate = new Date(schedule.date);  // Convert to date object

    // Determine the recurrence pattern based on frequency
    if (frequency === 'Once') {
      recurrenceSchedule = [initialClassDate];
    } else if (frequency === 'Weekly') {
      for (let i = 0; i < 4; i++) {
        const newDate = new Date(initialClassDate);
        newDate.setDate(newDate.getDate() + i * 7);  // Add 7 days for weekly recurrence
        recurrenceSchedule.push(newDate);
      }
    } else if (frequency === 'Bi-Weekly') {
      for (let i = 0; i < 4; i++) {
        const newDate = new Date(initialClassDate);
        newDate.setDate(newDate.getDate() + i * 14);  // Add 14 days for bi-weekly recurrence
        recurrenceSchedule.push(newDate);
      }
    } else if (frequency === 'Monthly') {
      for (let i = 0; i < 4; i++) {
        const newDate = new Date(initialClassDate);
        newDate.setMonth(newDate.getMonth() + i);  // Add 1 month for monthly recurrence
        recurrenceSchedule.push(newDate);
      }
    }

    // Fetch lead and staff by their IDs
    const lead = await Lead.findById(leadId);
    const staff = await Staff.findById(staffId);

    // If the lead or staff doesn't exist, return an error
    if (!lead) {
      res.status(400).json({ success: false, message: 'Lead not found.' });
      return;
    }
    if (!staff) {
      res.status(400).json({ success: false, message: 'Staff not found.' });
      return;
    }

    // Create the class with the recurrence schedule and assigned lead and staff
    const newClass = new Class({
      name,
      description,
      location,
      schedule: {
        date: recurrenceSchedule[0],  // The first date in the recurrence
        startTime: schedule.startTime,
        duration: schedule.duration,
      },
      totalCapacity,
      frequency,
      workType,
      lead: lead._id, 
      staff: staff._id, 
    });

    // Save the new class
    await newClass.save();
    const io = req.app.get('io');
const classDateTime = new Date(`${recurrenceSchedule[0].toISOString().split('T')[0]}T${schedule.startTime}`);
const times = [
  new Date(classDateTime.getTime() - 24 * 60 * 60 * 1000),
  new Date(classDateTime.getTime() - 60 * 60 * 1000),
];

scheduleNotification(lead._id as string, `Reminder: Class "${name}" at ${location}`, times, 'Class', io);


    // Populate lead and staff details in the response
    const populatedClass = await newClass.populate('lead staff'); 

    res.status(201).json({
      success: true,
      message: 'Class created successfully!',
      data: {
        ...populatedClass.toObject(),
        recurrenceSchedule,
      },
    });
  } catch (err) {
    next(err); 
  }
};

export const updateClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { classId } = req.params;  // Get class ID from route parameter
  const {
    name,
    description,
    location,
    schedule,
    totalCapacity,
    frequency,
    workType,
    leadId,   // leadId to update lead reference
    staffId,  // staffId to update staff reference
  } = req.body;

  try {
    // Find the class by ID and ensure the type is correct
    const classToUpdate = await Class.findById(classId).exec();

    // Check if class exists
    if (!classToUpdate) {
       res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
      return;
    }

    // Update the class details
    if (name) classToUpdate.name = name;
    if (description) classToUpdate.description = description;
    if (location) classToUpdate.location = location;
    if (schedule) {
      if (schedule.date) classToUpdate.schedule.date = schedule.date;
      if (schedule.startTime) classToUpdate.schedule.startTime = schedule.startTime;
      if (schedule.duration) classToUpdate.schedule.duration = schedule.duration;
    }
    if (totalCapacity) classToUpdate.totalCapacity = totalCapacity;
    if (frequency) classToUpdate.frequency = frequency;
    if (workType) classToUpdate.workType = workType;

    // Update the lead and staff references
    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (lead) classToUpdate.lead = lead._id as typeof classToUpdate.lead;
    }
    if (staffId) {
      const staff = await Staff.findById(staffId);
      if (staff) classToUpdate.staff = staff._id as typeof classToUpdate.staff;
    }

    // Save the updated class
    await classToUpdate.save();

    // Populate lead and staff details in the response
    const updatedClass = await classToUpdate.populate('lead staff');

    res.status(200).json({
      success: true,
      message: 'Class updated successfully!',
      data: updatedClass,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;  // Extract status from query params

    // Initialize the filter object for querying
    let filter: any = {};  

    // If status is provided in the query parameters
    if (status) {
      // Validate status value
      if (status !== 'active' && status !== 'inactive') {
         res.status(400).json({
          success: false,
          message: "Invalid status. Please use 'active' or 'inactive'."
        });
        return;
      }
      // Add status filter
      filter = { status: status.trim().toLowerCase() };  // Ensure case-sensitivity by using toLowerCase
    }

    console.log('Using filter:', filter);  // Log the filter before querying the database

    // Query the database with the built filter
    const classes = await Class.find(filter);

    // Check if any classes are found
    if (!classes || classes.length === 0) {
       res.status(404).json({
        success: false,
        message: 'No classes found.'
      });
    }

    // Return the classes data
     res.status(200).json({
      success: true,
      message: 'Classes fetched successfully.',
      data: classes
    });
  } catch (err) {
    // Ensure no response is sent before the error handling
    next(err);  // Pass any errors to the global error handler
  }
};




export const updateClassStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { classId } = req.params;  // Get class ID from route parameter
  const { status } = req.body;     // Get new status from request body

  // Validate status
  if (!status || (status !== 'active' && status !== 'inactive')) {
     res.status(400).json({
      success: false,
      message: "Invalid status. Please use 'active' or 'inactive'."
    });
  }

  try {
    // Find class by ID
    const classToUpdate = await Class.findById(classId);

    if (!classToUpdate) {
       res.status(404).json({
        success: false,
        message: 'Class not found.'
      });
      return;
    }

    // Update the status of the class
    classToUpdate.status = status;

    // Save the updated class
    await classToUpdate.save();

    res.status(200).json({
      success: true,
      message: 'Class status updated successfully!',
      data: classToUpdate
    });
  } catch (err) {
    next(err);
  }
};


  export const deleteClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { classId } = req.params;  // Get class ID from route parameter
  
    try {
      // Find the class by ID and delete it
      const classToDelete = await Class.findByIdAndDelete(classId);
  
      if (!classToDelete) {
         res.status(404).json({
          success: false,
          message: 'Class not found.',
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Class deleted successfully!',
      });
    } catch (err) {
      next(err); 
    }
  };