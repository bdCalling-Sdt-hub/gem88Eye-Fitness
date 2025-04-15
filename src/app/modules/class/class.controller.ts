import { Request, Response, NextFunction } from 'express';
import Class from './class.model'; 
import Lead from '../contact/leads.model';
import Staff from '../staff/staff.model';
import { scheduleNotification } from '../../../util/scheduleNotification';
import moment from 'moment';
import { Location } from '../Admin/location.model'; // Assuming you have a Location model
export const getPredefinedClassNames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const classNames = await Class.find().select('name');


    res.status(200).json({
      success: true,
      message: 'Predefined class names fetched successfully.',
      data: classNames
    });
  } catch (err) {
    next(err); 
  }
};

// export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const {
//     name,
//     location,
//     schedule, // Expecting the schedule to include dates and sessions
//     totalCapacity,
//     frequency,
//     workType,
//     leadId,
//     staffId,
//   } = req.body;

//   try {
//     // Validate required fields
//     if (!name || !location || !schedule || !totalCapacity || !frequency || !workType || !leadId || !staffId) {
//        res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields (name, location, schedule, totalCapacity, frequency, workType, leadId, staffId)',
//       });
//     }

//     // Validate each session in the schedule
//     schedule.forEach((item: any) => {
//       if (!item.date || !Array.isArray(item.sessions) || item.sessions.length === 0) {
//         throw new Error(`Invalid session data for date: ${item.date}`);
//       }
//     });

//     // Fetch lead and staff from their IDs
//     const lead = await Lead.findById(leadId);
//     const staff = await Staff.findById(staffId);

//     if (!lead || !staff) {
//        res.status(400).json({
//         success: false,
//         message: 'Lead or Staff not found.',
//       });
//       return;
//     }

//     // Create a new class instance
//     const newClass = new Class({
//       name,
//       location,
//       schedule,  
//       totalCapacity,
//       frequency,
//       workType,
//       lead: lead._id,
//       staff: staff._id,
//     });

//     // Save the new class to the database
//     const savedClass = await newClass.save();

//     // Return the response with the saved class
//     res.status(201).json({
//       success: true,
//       message: 'Class created successfully!',
//       data: savedClass,
//     });
//   } catch (err) {
//     next(err); // Pass the error to the error handler
//   }
// };
export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const {
    name,
    locationId,  
    schedule, 
    totalCapacity,
    frequency,
    workType,
    leadId,
    staffId,
  } = req.body;

  try {
    if (!name || !locationId || !schedule || !totalCapacity || !frequency || !workType || !leadId || !staffId) {
       res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, locationId, schedule, totalCapacity, frequency, workType, leadId, staffId)',
      });
    }
    schedule.forEach((item: any) => {
      if (!item.date || !Array.isArray(item.sessions) || item.sessions.length === 0) {
        throw new Error(`Invalid session data for date: ${item.date}`);
      }
    });


    const lead = await Lead.findById(leadId);
    const staff = await Staff.findById(staffId);

    if (!lead || !staff) {
       res.status(400).json({
        success: false,
        message: 'Lead or Staff not found.',
      });
      return;
    }

    const location = await Location.findById(locationId);
    if (!location) {
       res.status(400).json({
        success: false,
        message: 'Location not found.',
      });
      return;
    }

    const newClass = new Class({
      name,
      location: location._id,  
      schedule,  
      totalCapacity,
      frequency,
      workType,
      lead: lead._id,
      staff: staff._id,
    });


    const savedClass = await newClass.save();

    const populatedClass = await savedClass.populate('location');


     res.status(201).json({
      success: true,
      message: 'Class created successfully!',
      data: populatedClass,
    });
  } catch (err) {
    next(err); 
  }
};

export const updateClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { classId } = req.params;
  const {
    name,
    location,
    schedule,  // Expecting array of sessions for different dates
    totalCapacity,
    frequency,
    workType,
    leadId,
    staffId,
  } = req.body;

  try {
    const classToUpdate = await Class.findById(classId).exec();

    if (!classToUpdate) {
      res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
      return;
    }

    if (name) classToUpdate.name = name;
    if (location) classToUpdate.location = location;
    if (schedule) classToUpdate.schedule = schedule;  // Update the entire schedule with multiple sessions
    if (totalCapacity) classToUpdate.totalCapacity = totalCapacity;
    if (frequency) classToUpdate.frequency = frequency;
    if (workType) classToUpdate.workType = workType;

    // Update lead
    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (lead) classToUpdate.lead = lead._id as typeof classToUpdate.lead;
    }

    // Update staff
    if (staffId) {
      const staff = await Staff.findById(staffId);
      if (staff) classToUpdate.staff = staff._id as typeof classToUpdate.staff;
    }

    await classToUpdate.save();

    const updatedClass = await classToUpdate.populate('lead staff');

    res.status(200).json({
      success: true,
      message: 'Class updated successfully!',
      data: updatedClass,
    });
  } catch (err) {
    next(err);  // Pass any errors to the global error handler
  }
};

// export const getAllClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { status } = req.query; 

//     let filter: any = {};  

//     if (status) {
//       if (status !== 'active' && status !== 'inactive') {
//          res.status(400).json({
//           success: false,
//           message: "Invalid status. Please use 'active' or 'inactive'."
//         });
//         return;
//       }
//       filter = { status: status.trim().toLowerCase() }; 
//     }

//     console.log('Using filter:', filter);  

//     const classes = await Class.find(filter)
//       .populate('lead', 'lead_name')
//       .populate('staff', 'name')
//       .populate('schedule', 'date');

//     if (!classes || classes.length === 0) {
//        res.status(404).json({
//         success: false,
//         message: 'No classes found.'
//       });
//     }

//      res.status(200).json({
//       success: true,
//       message: 'Classes fetched successfully.',
//       data: classes
//     });
//   } catch (err) {
//     next(err); 
//   }
// };

export const getAllClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query; 

    let filter: any = {};  

    if (status) {
      if (status !== 'active' && status !== 'inactive') {
          res.status(400).json({
          success: false,
          message: "Invalid status. Please use 'active' or 'inactive'."
        });
        return;
      }
      filter = { status: status.trim().toLowerCase() }; 
    }

    console.log('Using filter:', filter);  

    const classes = await Class.find(filter)
      .populate('lead', 'lead_name')
      .populate('staff', 'name')
      .populate('schedule', 'date')
      .populate('location'); 

    if (!classes || classes.length === 0) {
        res.status(404).json({
        success: false,
        message: 'No classes found.'
      });
    }

     res.status(200).json({
      success: true,
      message: 'Classes fetched successfully.',
      data: classes
    });
  } catch (err) {
    next(err); 
  }
};

export const getClassById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { classId } = req.params;  // Extract classId from URL params

  try {
    // Fetch the class by ID and populate lead, staff, and schedule
    const classDetails = await Class.findById(classId)
      .populate('lead', 'lead_name')   // Populate lead_name field from Lead model
      .populate('staff', 'name')       // Populate name field from Staff model
      .populate('schedule', 'date startTime duration');  // Populate schedule date, startTime, duration

    // Check if the class was found
    if (!classDetails) {
       res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
    }

    // Return the class data
    res.status(200).json({
      success: true,
      message: 'Class fetched successfully.',
      data: classDetails,
    });
  } catch (err) {
    next(err);  // Pass any errors to the global error handler
  }
};
// export const getClassStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     // Fetch all classes with populated data
//     const allClasses = await Class.find()
//       .populate('lead', 'lead_name')
//       .populate('staff', 'name');

//     if (!allClasses || allClasses.length === 0) {
//       res.status(404).json({
//         success: false,
//         message: 'No classes found.',
//       });
//       return;
//     }

//     const currentDate = moment();

//     const completedClasses: any[] = [];
//     const runningClasses: any[] = [];
//     const notRunningClasses: any[] = [];

//     // Iterate through all classes to categorize based on session dates
//     allClasses.forEach((classItem) => {
//       // Iterate through each session in the schedule array
//       classItem.schedule.forEach((session) => {
//         const sessionDate = moment(session.date);  // Convert session date to moment
//         const isClassActive = classItem.status === 'active';  // Check if class is active

//         // Check if session date is in the past and class is inactive (completed class)
//         if (sessionDate.isBefore(currentDate) && !isClassActive) {
//           completedClasses.push(classItem);
//         }
//         // Check if class is active and session date is in the future or ongoing (running class)
//         else if (isClassActive && sessionDate.isSameOrAfter(currentDate)) {
//           runningClasses.push(classItem);
//         }
//         // If class is inactive and session date is in the future (not running class)
//         else if (!isClassActive && sessionDate.isSameOrAfter(currentDate)) {
//           notRunningClasses.push(classItem);
//         }
//       });
//     });

//     // Return response with class statistics
//     res.status(200).json({
//       success: true,
//       message: 'Classes categorized successfully.',
//       data: {
//         totalClasses: allClasses.length,
//         completedClasses: completedClasses.length,
//         runningClasses: runningClasses.length,
//         notRunningClasses: notRunningClasses.length,
//         completedClassesData: completedClasses, 
//         runningClassesData: runningClasses,     
//         notRunningClassesData: notRunningClasses,
//       },
//     });
//   } catch (err) {
//     next(err);  // Pass any errors to the global error handler
//   }
// };

export const getClassStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { staff, location, className, date } = req.query; // Extract query parameters for filtering
    const filter: any = {};  // Initialize filter object

    // Filter by staff name or staff ID
    if (staff) {
      filter['staff'] = staff; // If staff is provided, filter by staff ID or name (depending on the requirement)
    }

    // Filter by location
    if (location) {
      filter['location'] = { $regex: location, $options: 'i' }; // Case-insensitive regex search for location
    }

    // Filter by class name
    if (className) {
      filter['name'] = { $regex: className, $options: 'i' }; // Case-insensitive regex search for class name
    }

    // Filter by date range (e.g., today, this week, etc.)
    if (date) {
      const selectedDate = moment(typeof date === 'string' ? date : '').startOf('day'); // Normalize the date to start of day

      filter['schedule.date'] = { $gte: selectedDate.toDate() }; // Filter by classes occurring on or after the given date
    }

    // Fetch all classes with populated data based on the filters
    const allClasses = await Class.find(filter)
      .populate('lead', 'lead_name')
      .populate('staff', 'name');

    if (!allClasses || allClasses.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No classes found.',
      });
      return;
    }

    const currentDate = moment();

    const completedClasses: any[] = [];
    const runningClasses: any[] = [];
    const notRunningClasses: any[] = [];

    // Iterate through all classes to categorize based on session dates
    allClasses.forEach((classItem) => {
      // Iterate through each session in the schedule array
      classItem.schedule.forEach((session) => {
        const sessionDate = moment(session.date);  // Convert session date to moment
        const isClassActive = classItem.status === 'active';  // Check if class is active

        // Check if session date is in the past and class is inactive (completed class)
        if (sessionDate.isBefore(currentDate) && !isClassActive) {
          completedClasses.push(classItem);
        }
        // Check if class is active and session date is in the future or ongoing (running class)
        else if (isClassActive && sessionDate.isSameOrAfter(currentDate)) {
          runningClasses.push(classItem);
        }
        // If class is inactive and session date is in the future (not running class)
        else if (!isClassActive && sessionDate.isSameOrAfter(currentDate)) {
          notRunningClasses.push(classItem);
        }
      });
    });

    // Return response with class statistics
    res.status(200).json({
      success: true,
      message: 'Classes categorized successfully.',
      data: {
        totalClasses: allClasses.length,
        completedClasses: completedClasses.length,
        runningClasses: runningClasses.length,
        notRunningClasses: notRunningClasses.length,
        completedClassesData: completedClasses, 
        runningClassesData: runningClasses,     
        notRunningClassesData: notRunningClasses,
      },
    });
  } catch (err) {
    next(err);  // Pass any errors to the global error handler
  }
};

export const updateClassStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { classId } = req.params; 
  const { status } = req.body;    

  if (!status || (status !== 'active' && status !== 'inactive')) {
     res.status(400).json({
      success: false,
      message: "Invalid status. Please use 'active' or 'inactive'."
    });
  }

  try {

    const classToUpdate = await Class.findById(classId);

    if (!classToUpdate) {
       res.status(404).json({
        success: false,
        message: 'Class not found.'
      });
      return;
    }


    classToUpdate.status = status;


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
    const { classId } = req.params; 
  
    try {

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