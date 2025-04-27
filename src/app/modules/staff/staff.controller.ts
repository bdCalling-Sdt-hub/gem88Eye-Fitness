import { NextFunction, Request, Response } from "express";
import Staff from "./staff.model";
import mongoose from "mongoose";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Role from "../role/role.model";
import path from "path";
import { emailHelper } from "../../../helpers/emailHelper";
import StaffAvailability ,{ IStaffAvailability } from "../staff/staff.aviliability.model";
import moment from "moment";


// export const createStaff = async (req: Request, res: Response) => {
//   fileUploadHandler()(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ message: "File upload error", error: err });
//     }

//     try {
//       const { name, expiryDate } = req.body;

//       // Check if files exist under the "doc" field and get the first file path
//       let document: string | null = null;

//       if (req.files && "doc" in req.files) {
//         // Get the first file (since only one file is allowed)
//         const file = (req.files["doc"] as Express.Multer.File[])[0];
//         document = path.join('uploads', 'doc', file.filename).replace(/\\/g, '/');
//       }

//       // Create a new staff record with the document path
//       const staff = new Staff({ name, documents: document ?? "", expiryDate, status: "valid" });
//       await staff.save();

//       res.status(201).json({
//         message: "Staff created successfully",
//         staff,
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Error creating staff", error });
//     }
//   });
// };

export const createStaff = async (req: Request, res: Response) => {
  fileUploadHandler()(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "File upload error", error: err });
    }

    try {
      const { name, expiryDate } = req.body;

      let document: string | null = null;

      if (req.files && "documents" in req.files) {
        const file = (req.files["documents"] as Express.Multer.File[])[0];

        document = `/uploads/documents/${file.filename}`;
      }


      const staff = new Staff({ name, documents: document ?? "", expiryDate, status: "valid" });
      await staff.save();

      res.status(201).json({
        message: "Staff created successfully",
        staff,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating staff", error });
    }
  });
};

// export const addStaffAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { staffId, availability, date } = req.body; 

//   if (!staffId || !availability || !Array.isArray(availability) || !date) {
//      res.status(400).json({ success: false, message: 'Staff ID, availability, and date are required!' });
//      return;
//   }


//   const parsedDate = moment(date, 'YYYY-MM-DD', true).isValid() ? moment(date).toDate() : null;
//   if (!parsedDate) {
//      res.status(400).json({ success: false, message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD).' });
//   }

//   try {
//     const availabilityRecords = await Promise.all(
//       availability.map(async (dayAvailability) => {
//         const { day, startTime, endTime } = dayAvailability;

//         if (!startTime || !endTime) {
//           return res.status(400).json({ success: false, message: 'Both startTime and endTime are required for each availability.' });
//         }

//         const newAvailability = new StaffAvailability({
//           staff: staffId,
//           day,
//           date: parsedDate,
//           startTime,
//           endTime,
//         });

//         await newAvailability.save();
//         return newAvailability;
//       })
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Staff availability added successfully!',
//       data: availabilityRecords,
//     });
//   } catch (err) {
//     next(err); 
//   }
// };


// Define interfaces for request body structure
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  day: string;
  timeSlots: TimeSlot[];
}

interface StaffAvailabilityRequest {
  staffId: string;
  date: string;
  availability: DayAvailability[];
}

interface GroupedTimeSlot {
  startTime: string;
  endTime: string;
  _id: mongoose.Types.ObjectId;
}

interface GroupedDayAvailability {
  day: string;
  date: string;
  staffId: mongoose.Types.ObjectId;
  timeSlots: GroupedTimeSlot[];
}

// export const addStaffAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { staffId, availability, date } = req.body as StaffAvailabilityRequest;

//   if (!staffId || !availability || !Array.isArray(availability) || !date) {
//     res.status(400).json({ success: false, message: 'Staff ID, availability, and date are required!' });
//     return;
//   }

//   const parsedDate = moment.utc(date, 'YYYY-MM-DD', true);
//   if (!parsedDate.isValid()) {
//     res.status(400).json({ success: false, message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD).' });
//     return;
//   }

//   try {
//     const availabilityRecords: IStaffAvailability[] = [];
    
//     for (const dayAvailability of availability) {
//       const { day, timeSlots } = dayAvailability;

//       if (!timeSlots || !Array.isArray(timeSlots)) {
//         res.status(400).json({ success: false, message: `Time slots are required for ${day}.` });
//         return;
//       }

//       for (const timeSlot of timeSlots) {
//         const { startTime, endTime } = timeSlot;

//         if (!startTime || !endTime) {
//           res.status(400).json({ success: false, message: `Both startTime and endTime are required for ${day}.` });
//           return;
//         }

//         const newAvailability = new StaffAvailability({
//           staff: staffId,
//           day,
//           date: parsedDate.toDate(),
//           startTime,
//           endTime,
//         });

//         const savedAvailability = await newAvailability.save();
//         availabilityRecords.push(savedAvailability);
//       }
//     }

//     const groupedByDay: Record<string, GroupedDayAvailability> = {};
    
//     availabilityRecords.forEach(record => {
//       const day = record.day;
      
//       if (!groupedByDay[day]) {
//         groupedByDay[day] = {
//           day,
//           date: moment.utc(record.date).format('YYYY-MM-DD'),
//           staffId: record.staff as unknown as mongoose.Types.ObjectId,
//           timeSlots: []
//         };
//       }
      
//       groupedByDay[day].timeSlots.push({
//         startTime: record.startTime,
//         endTime: record.endTime,
//         _id: record._id as mongoose.Types.ObjectId
//       });
//     });

//     const formattedResponse = Object.values(groupedByDay);

//     res.status(201).json({
//       success: true,
//       message: 'Staff availability added successfully!',
//       data: formattedResponse,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const addStaffAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { staffId, availability, date } = req.body as StaffAvailabilityRequest;

  if (!staffId || !availability || !Array.isArray(availability) || !date) {
    res.status(400).json({ success: false, message: 'Staff ID, availability, and date are required!' });
    return;
  }

  const parsedDate = moment.utc(date, 'YYYY-MM-DD', true);
  if (!parsedDate.isValid()) {
    res.status(400).json({ success: false, message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD).' });
    return;
  }

  try {
    const availabilityRecords: IStaffAvailability[] = [];
    
    for (const dayAvailability of availability) {
      const { day, timeSlots } = dayAvailability;

      if (!timeSlots || !Array.isArray(timeSlots)) {
        res.status(400).json({ success: false, message: `Time slots are required for ${day}.` });
        return;
      }

      for (const timeSlot of timeSlots) {
        const { startTime, endTime } = timeSlot;

        if (!startTime || !endTime) {
          res.status(400).json({ success: false, message: `Both startTime and endTime are required for ${day}.` });
          return;
        }

        // Check if an availability record with the same staff, day, time already exists
        const existingRecord = await StaffAvailability.findOne({
          staff: staffId,
          day,
          date: parsedDate.toDate(),
          startTime,
          endTime,
        });

        if (existingRecord) {
          res.status(400).json({
            success: false,
            message: `Duplicate time slot for ${day} with start time ${startTime} and end time ${endTime}.`,
          });
          return;
        }

        // Create and save the new availability record
        const newAvailability = new StaffAvailability({
          staff: staffId,
          day,
          date: parsedDate.toDate(),
          startTime,
          endTime,
        });

        const savedAvailability = await newAvailability.save();
        availabilityRecords.push(savedAvailability);
      }
    }

    // Group records by day
    const groupedByDay: Record<string, GroupedDayAvailability> = {};

    availabilityRecords.forEach(record => {
      const day = record.day;
      
      if (!groupedByDay[day]) {
        groupedByDay[day] = {
          day,
          date: moment.utc(record.date).format('YYYY-MM-DD'),
          staffId: record.staff as unknown as mongoose.Types.ObjectId,
          timeSlots: []
        };
      }

      groupedByDay[day].timeSlots.push({
        startTime: record.startTime,
        endTime: record.endTime,
        _id: record._id as mongoose.Types.ObjectId
      });
    });

    const formattedResponse = Object.values(groupedByDay);

    res.status(201).json({
      success: true,
      message: 'Staff availability added successfully!',
      data: formattedResponse,
    });
  } catch (err) {
    next(err);
  }
};
const getTodayDayOfWeek = () => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  return daysOfWeek[today.getDay()];
};

export const getAllStaffAvailabilityByDay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { day = getTodayDayOfWeek() } = req.query;

  try {
    const availability = await StaffAvailability.find({ day })
      .select('startTime endTime staff')
      .populate('staff', 'name')  
      .exec();

    if (!availability || availability.length === 0) {
       res.status(404).json({ success: false, message: 'No availability found for the specified day' });
    }

    res.status(200).json({
      success: true,
      message: `Availability for ${day} fetched successfully.`,
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    let filter: Record<string, any> = {};
    if (status === "valid") {
      filter = { status: "valid" };
    } else if (status === "invalid") {
      filter = { status: "invalid" };
    }

    const staff = await Staff.find(filter).select("name status documents expiryDate role createdAt");

    const staffWithAvailability = await Promise.all(
      staff.map(async (staffMember) => {
        const availabilityRecords = await StaffAvailability.find({ staff: staffMember._id })
          .select("day startTime endTime")
          .sort({ day: 1, startTime: 1 });
        
        const groupedAvailability: Record<string, any> = {};
        
        availabilityRecords.forEach(record => {
          const { day, startTime, endTime, _id } = record;
          
          if (!groupedAvailability[day]) {
            groupedAvailability[day] = {
              day,
              timeSlots: []
            };
          }
          
          groupedAvailability[day].timeSlots.push({
            startTime,
            endTime,
            _id
          });
        });
        
        const formattedAvailability = Object.values(groupedAvailability);
        
        return {
          ...staffMember.toObject(),
          documents: staffMember.documents ? `${staffMember.documents}` : null,
          availability: formattedAvailability
        };
      })
    );

    res.status(200).json({
      message: "Staff retrieved successfully",
      staff: staffWithAvailability,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching staff",
      error: error,
    });
  }
};

  export const editStaff = async (req: Request, res: Response) => {
    upload(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
  
      try {
        const { staffId } = req.params;
        const { name, expiryDate, businessName, address } = req.body;
  
        const staff = await Staff.findById(staffId);
        if (!staff) {
          return res.status(404).json({ message: "Staff not found" });
        }

        if (name) staff.name = name;
        if (expiryDate) staff.expiryDate = expiryDate;
        if (businessName) staff.businessName = businessName;
        if (address) staff.address = address;
  
        if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })['image']) {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const imagePath = '/uploads/image/' + files['image'][0].filename;
          staff.image = imagePath;
        }
  
        await staff.save();
  
        res.status(200).json({
          message: "Staff updated successfully",
          staff,
        });
      } catch (error) {
        res.status(500).json({ message: "Error updating staff", error });
      }
    });
  };
  


  //Delete staff
  export const deleteStaff = async (req: Request, res: Response) => {
    try {
      const { staffId } = req.params;
  
      const staff = await Staff.findByIdAndDelete(staffId);
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
  
      res.status(200).json({
        message: "Staff deleted successfully",
        staff,
      });
    } catch (error) { 
      res.status(500).json({ message: "Error deleting staff", error });
    }
  };
  

export const staffLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
  
      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!user.password) {
        return res.status(400).json({ message: "User does not have a password set" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: "1d" }
      );
  
      res.status(200).json({ message: "Login successful", token , user });
    } catch (error) {
      console.error("Error in staffLogin:", error);
      res.status(500).json({ message: "Error logging in", error});
    }
  };

  export const getUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id; 
  
      const user = await Role.findById(userId).select('-password'); 
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userProfile = {
        id: user._id,
        name: user.name,
        businessName: user.businessName,
        address: user.address,
        email: user.email,
        role: user.role,
        image: user.image || 'https://i.ibb.co/z5YHLV9/profile.png',
        accessControls: user.accessControls,
       
      };
  
      res.status(200).json({ message: 'User profile fetched successfully', user: userProfile });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Error fetching user profile', error });
    }
  };

  const upload = fileUploadHandler();

  export const updateProfile = async (req: Request, res: Response) => {
    upload(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
  
      try {
        const { name, email,businessName,address, password } = req.body;
        const user = req.user; 
  
        const updatedUserData: any = {};
  
        if (name) {
          updatedUserData.name = name;
        }
  
        if (email) {
          updatedUserData.email = email;
        }

        if (businessName) {
          updatedUserData.businessName = businessName;
        }

        if (address) {
          updatedUserData.address = address;
        }
  

        if (password) {
          const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10)); 
          updatedUserData.password = hashedPassword;
        }
  
        if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })['image']) {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const imagePath = '/uploads/image/' + files['image'][0].filename;  
          updatedUserData.image = imagePath;
        }
  
        const updatedUser = await Role.findByIdAndUpdate(user.id, updatedUserData, {
          new: true,  
          runValidators: true, 
        });
  

        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        const userProfile = {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          businessName: updatedUser.businessName,
          address: updatedUser.address,
          role: updatedUser.role,
          accessControls: updatedUser.accessControls,
          image: updatedUser.image || 'https://i.ibb.co/z5YHLV9/profile.png', 
          createdAt: updatedUser.createdAt,
        
        };
  
        res.status(200).json({ message: 'Profile updated successfully', user: userProfile });
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error });
      }
    });
  };

  export const setPassword = async (req: Request, res: Response) => {
    try {
      const { email, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Error in setPassword:", error);
      res.status(500).json({ message: "Error setting password", error });
    }
  };


  export const forgetPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
  
      user.resetPasswordOTP = otp;
      user.resetPasswordExpires = otpExpires;
      await user.save();
  

      await emailHelper.sendEmail({
        to: email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
      });
  
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error sending OTP", error });
    }
  };

  export const verifyOTP = async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
  
      const user = await Role.findOne({ email });
      if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
        return res.status(400).json({ message: "Invalid OTP request" });
      }
  
      if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
  

      user.resetPasswordOTP;
      user.resetPasswordExpires;
      await user.save();
  
      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error verifying OTP", error });
    }
  };


  export const resetPassword = async (req: Request, res: Response) => {
    try {
      const { email, newPassword, confirmPassword } = req.body;
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error resetting password", error });
    }
  };
  
  
