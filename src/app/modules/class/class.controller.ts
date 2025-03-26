import { Request, Response, NextFunction } from 'express';
import Class from './class.model';  // Assuming the Class model is located here

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

// Create a new class with optional recurrence
export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, description, location, schedule, totalCapacity, frequency } = req.body;

  // Validate required fields
  if (!name || !description || !location || !schedule || !totalCapacity || !frequency) {
    res.status(400).json({
      success: false,
      message: 'Please provide all required fields (name, description, location, schedule, totalCapacity, frequency)',
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

    // Create the class with the recurrence schedule
    const newClass = new Class({
      name,
      description,
      location,
      schedule: {
        date: recurrenceSchedule[0],  // The first date in the recurrence
        startTime: schedule.startTime,
        duration: schedule.duration
      },
      totalCapacity,
      frequency,
    });

    // Save the new class
    await newClass.save();

    res.status(201).json({
      success: true,
      message: 'Class created successfully!',
      data: {
        ...newClass.toObject(),
        recurrenceSchedule
      },
    });
  } catch (err) {
    next(err);  // Pass error to the global error handler
  }
};

export const getAllClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch all classes, including their fields: name, description, location, schedule, and frequency
      const classes = await Class.find();
  
      if (!classes || classes.length === 0) {
         res.status(404).json({
          success: false,
          message: 'No classes found.'
        });
      }
  
      // Return all classes with their details
      res.status(200).json({
        success: true,
        message: 'Classes fetched successfully.',
        data: classes
      });
    } catch (err) {
      // Pass any error that occurs to the global error handler
      next(err);
    }
  };