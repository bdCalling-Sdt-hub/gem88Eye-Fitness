import { Request, Response, NextFunction } from 'express';
import Class from './class.model'; 
import Lead from '../contact/leads.model';
import Staff from '../staff/staff.model';

import  {scheduleNotification}  from '../../../util/scheduleNotification';
import moment from 'moment';
import { Location } from '../Admin/location.model';
import Admin from '../Admin/admin.model';
import Notification from '../notification/notification.model';
import { string } from 'zod';
import mongoose from 'mongoose';
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
//     locationId,
//     schedule,
//     totalCapacity,
//     frequency,
//     workType,
//     leadId,
//     staffId,
//   } = req.body;

//   try {
//     if (!name || !locationId || !schedule || !totalCapacity || !frequency || !workType || !leadId || !staffId) {
//       res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields (name, locationId, schedule, totalCapacity, frequency, workType, leadId, staffId)',
//       });
//       return;
//     }

//     schedule.forEach((item: any) => {
//       if (!item.date || !Array.isArray(item.sessions) || item.sessions.length === 0) {
//         throw new Error(`Invalid session data for date: ${item.date}`);
//       }
//     });

//     const lead = await Lead.findById(leadId);
//     const staff = await Staff.findById(staffId);

//     if (!lead || !staff) {
//       res.status(400).json({
//         success: false,
//         message: 'Lead or Staff not found.',
//       });
//       return;
//     }

//     const location = await Location.findById(locationId);
//     if (!location) {
//       res.status(400).json({
//         success: false,
//         message: 'Location not found.',
//       });
//       return;
//     }

//     const newClass = new Class({
//       name,
//       location: location._id,
//       schedule,
//       totalCapacity,
//       frequency,
//       workType,
//       lead: lead._id,
//       staff: staff._id,
//     });

//     const savedClass = await newClass.save();

//     // Create notifications for the staff and lead
//     const notificationMessage = `You have been assigned to a new class: ${name}`;
//     const notificationDate = new Date(); // Adjust the scheduled time as needed

//     const notificationData = [
//       { userId: lead._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Class' },
//       { userId: staff._id, message: notificationMessage, scheduledTime: notificationDate, type: 'Class' }
//     ];

//     await Notification.insertMany(notificationData);

//     res.status(201).json({
//       success: true,
//       message: 'Class created and notifications sent!',
//       data: savedClass,
//     });
//   } catch (err) {
//     next(err);
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
      return;
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


    const notificationMessage = `You have been assigned to a new class: ${name}`;
    const notificationDate = new Date();

    const notificationData = [
      {
        userId: lead._id, 
        userModel: 'Lead',  
        message: notificationMessage, 
        scheduledTime: notificationDate, 
        type: 'Class'
      },
      {
        userId: staff._id, 
        userModel: 'Staff',
        message: notificationMessage, 
        scheduledTime: notificationDate, 
        type: 'Class'
      }
    ];

    await Notification.insertMany(notificationData);

    res.status(201).json({
      success: true,
      message: 'Class created and notifications sent!',
      data: savedClass,
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
    schedule, 
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
    if (schedule) classToUpdate.schedule = schedule; 
    if (totalCapacity) classToUpdate.totalCapacity = totalCapacity;
    if (frequency) classToUpdate.frequency = frequency;
    if (workType) classToUpdate.workType = workType;

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
    next(err); 
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
  const { classId } = req.params; 

  try {
    const classDetails = await Class.findById(classId)
      .populate('lead', 'lead_name')   
      .populate('staff', 'name')   
      .populate('schedule', 'date startTime duration');  

    if (!classDetails) {
       res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class fetched successfully.',
      data: classDetails,
    });
  } catch (err) {
    next(err);
  }
};

// export const getClassStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { staff, location, className, date, status } = req.query; 
//     const filter: any = {};  

//     if (staff) {
//       filter['staff'] = staff;
//     }

  
//     if (location) {
//       filter['location'] = { $regex: location, $options: 'i' }; 
//     }

//     if (className) {
//       filter['name'] = { $regex: className, $options: 'i' };
//     }

//     if (date) {
//       const selectedDate = moment(typeof date === 'string' ? date : '').startOf('day');
//       filter['schedule.date'] = { $gte: selectedDate.toDate() };
//     }

//     if (status) {
//       if (status === 'running') {
//         filter['status'] = 'active';
//       } else if (status === 'not running') {
//         filter['status'] = 'inactive';
//       }
//     }

//     const allClasses = await Class.find(filter)
//       .populate('lead', 'lead_name') 
//       .populate('staff', 'name') 
//       .populate('location', 'locationName') 
//       .exec();

//     if (!allClasses || allClasses.length === 0) {
//       res.status(404).json({
//         success: false,
//         message: 'No classes found.',
//       });
//       return;
//     }

//     const currentDate = moment();

//     let runningClassesCount = 0;
//     let completedClassesCount = 0;
//     let notRunningClassesCount = 0;

//     allClasses.forEach((classItem) => {
//       classItem.schedule.forEach((session) => {
//         const sessionDate = moment(session.date); 
//         const isClassActive = classItem.status === 'active'; 

//         if (sessionDate.isBefore(currentDate) && !isClassActive) {
//           completedClassesCount++;
//         }

//         else if (isClassActive && sessionDate.isSameOrAfter(currentDate)) {
//           runningClassesCount++;
//         }

//         else if (!isClassActive && sessionDate.isSameOrAfter(currentDate)) {
//           notRunningClassesCount++;
//         }
//       });
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Classes fetched successfully.',
//       data: {
//         totalClasses: allClasses.length,
//         runningClassesCount,
//         completedClassesCount,
//         notRunningClassesCount,
//         classesData: allClasses, 
//       },
//     });
//   } catch (err) {
//     next(err); 
//   }
// };
export const getClassStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { filter, status, date, location, staff, className,lead } = req.query;
    const filterQuery: any = {}; 

    console.log('Received filters:', req.query);

    if (filter) {
      const filterText = filter.toString().trim();

      filterQuery['name'] = { $regex: filterText, $options: 'i' }; 
      filterQuery['description'] = { $regex: filterText, $options: 'i' }; 


      filterQuery['staff.name'] = { $regex: filterText, $options: 'i' };

      filterQuery['location.locationName'] = { $regex: filterText, $options: 'i' };
    }

    if (status) {
      if (status === 'running') {
        filterQuery['status'] = 'active';
      } else if (status === 'not running') {
        filterQuery['status'] = 'inactive';
      }
    }

    if (date) {
      const selectedDate = moment(typeof date === 'string' ? date : '').startOf('day');
      filterQuery['schedule.date'] = { $gte: selectedDate.toDate() };
    }

    console.log('Constructed filter query:', filterQuery);

    const allClasses = await Class.find(filterQuery)
      .populate('lead', 'lead_name')
      .populate('staff', 'name')
      .populate('location', 'locationName') 
      .exec();

    console.log('Classes fetched:', allClasses);

    if (!allClasses || allClasses.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No classes found.',
      });
      return;
    }

    const currentDate = moment();
    let runningClassesCount = 0;
    let completedClassesCount = 0;
    let notRunningClassesCount = 0;

    allClasses.forEach((classItem) => {
      classItem.schedule.forEach((session) => {
        const sessionDate = moment(session.date);
        const isClassActive = classItem.status === 'active';

        if (sessionDate.isBefore(currentDate) && !isClassActive) {
          completedClassesCount++;
        } else if (isClassActive && sessionDate.isSameOrAfter(currentDate)) {
          runningClassesCount++;
        } else if (!isClassActive && sessionDate.isSameOrAfter(currentDate)) {
          notRunningClassesCount++;
        }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Classes fetched successfully.',
      data: {
        totalClasses: allClasses.length,
        runningClassesCount,
        completedClassesCount,
        notRunningClassesCount,
        classesData: allClasses,
      },
    });
  } catch (err) {
    console.error('Error occurred:', err);
    next(err);
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

  // const createAdminNotifications = async (appointment: any, p0: string, firstClassDate: Date, p1: any) => {
  //   try {
  //     // Fetch all admins
  //     const admins = await Admin.find();
  
  //     // Check if there are any admins
  //     if (admins.length === 0) {
  //       throw new Error('No admins found to send notifications');
  //     }
  
  //     // Prepare notification message and other fields
  //     const notificationMessage = `A new ${p0} has been booked for service: ${appointment.name} with lead: ${appointment.leadId}`;
  //     const notificationDate = new Date();  // Current date
  
  //     // Prepare notification data for all admins
  //     const notificationData = admins.map(admin => ({
  //       userId: admin._id,  // admin._id as the userId for the Admin user
  //       // Specify that the userModel is Admin
  //       message: notificationMessage,
  //       scheduledTime: notificationDate,
  //       type: p0  // Type can be 'Appointment' or 'Class'
  //     }));
  
  //     // Insert notifications into the database
  //     await Notification.insertMany(notificationData);
  
  //     console.log(`Admin notifications created for ${admins.length} admins`);
  
  //   } catch (err) {
  //     console.error('Error creating admin notifications:', err);
  //     throw new Error('Error creating admin notifications: ' + err);
  //   }
  // };
  
  // const createAdminNotifications = async (appointment: any, p0: string, firstClassDate: Date, p1: any) => {
  //   try {
  //     // Fetch all admins
  //     const admins = await Admin.find();
  
  //     // Check if there are any admins
  //     if (admins.length === 0) {
  //       throw new Error('No admins found to send notifications');
  //     }
  
  //     // Prepare notification message and other fields
  //     const notificationMessage = `A new ${p0} has been booked for service: ${appointment.name} with lead: ${appointment.leadId}`;
  //     const notificationDate = new Date();  // Current date
  
  //     // Prepare notification data for all admins
  //     const notificationData = admins.map(admin => ({
  //       userId: admin._id,  // admin._id as the userId for the Admin user
  //       userModel: 'Admin',  // Specify that the userModel is Admin
  //       message: notificationMessage,
  //       scheduledTime: notificationDate,
  //       type: p0  // Type can be 'Appointment' or 'Class'
  //     }));
  
  //     // Insert notifications into the database
  //     await Notification.insertMany(notificationData);
  
  //     console.log(`Admin notifications created for ${admins.length} admins`);
  
  //   } catch (err) {
  //     console.error('Error creating admin notifications:', err);
  //     throw new Error('Error creating admin notifications: ' + err);
  //   }
  // };
  
  
  
  