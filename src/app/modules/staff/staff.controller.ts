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
import StaffAvailability from "./staff.aviliability.model";
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

export const addStaffAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { staffId, availability, date } = req.body; 

  if (!staffId || !availability || !Array.isArray(availability) || !date) {
     res.status(400).json({ success: false, message: 'Staff ID, availability, and date are required!' });
     return;
  }


  const parsedDate = moment(date, 'YYYY-MM-DD', true).isValid() ? moment(date).toDate() : null;
  if (!parsedDate) {
     res.status(400).json({ success: false, message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD).' });
  }

  try {
    const availabilityRecords = await Promise.all(
      availability.map(async (dayAvailability) => {
        const { day, startTime, endTime } = dayAvailability;

        if (!startTime || !endTime) {
          return res.status(400).json({ success: false, message: 'Both startTime and endTime are required for each availability.' });
        }

        const newAvailability = new StaffAvailability({
          staff: staffId,
          day,
          date: parsedDate,
          startTime,
          endTime,
        });

        await newAvailability.save();
        return newAvailability;
      })
    );

    res.status(201).json({
      success: true,
      message: 'Staff availability added successfully!',
      data: availabilityRecords,
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

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { status } = req.query; 


    let filter = {};
    if (status === "valid") {
      filter = { status: "valid" };
    } else if (status === "invalid") {
      filter = { status: "invalid" };
    }

    const staff = await Staff.find(filter).select("name status documents expiryDate role createdAt");

    const staffWithDocumentPaths = staff.map((staffMember) => ({
      ...staffMember.toObject(),
      documents: staffMember.documents ? `${staffMember.documents}` : null, 
    }));

    res.status(200).json({
      message: "Staff retrieved successfully",
      staff: staffWithDocumentPaths,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff", error });
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
        image: user.image,
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
  
  
