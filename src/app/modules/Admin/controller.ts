import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "./admin.model";
import {Location} from "./location.model"; 
import { USStates } from "../../../enums/location.enum";
import { isEmail } from 'validator';
import { emailHelper } from "../../../helpers/emailHelper";
import crypto from 'crypto';
import Role from "../role/role.model";
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
    res.status(200).json({ message: "Login successful", token, admin });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;  // Email passed in the body

    // Check if the email exists in Admin model
    let user = await Admin.findOne({ email });

    // If not found in Admin, check in Staff model
    if (!user) {
      user = await Role.findOne({ email });
    }

    // If user doesn't exist, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP (6-digit number)
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiry (e.g., 10 minutes)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP and expiration time to the user record
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    // Send OTP to user's email
    const htmlContent = `
      <p>Your OTP for password reset is <strong>${otp}</strong>.</p>
      <p>This OTP will expire in 10 minutes.</p>
    `;
    
    await emailHelper.sendEmail({
      to: email,
      subject: 'Password Reset OTP',
      html: htmlContent,
    });

    res.status(200).json({ message: "OTP sent successfully to your email." });

  } catch (error) {
    console.error("Error in forgetPassword:", error);
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

// export const verifyOTP = async (req: Request, res: Response) => {
//   try {
//     const { email, otp, role } = req.body;

//     // Find the user by email
//     let user;
//     if (role === 'admin') {
//       user = await Admin.findOne({ email });
//     } else if (role === 'staff') {
//       user = await Role.findOne({ email });
//     }

//     if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
//       return res.status(400).json({ message: "Invalid OTP request" });
//     }

//     // Check if OTP matches and is not expired
//     if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     // Clear OTP fields after verification
//     user.resetPasswordOTP = '';
//     user.resetPasswordExpires = new Date(0); // Set to epoch time as a placeholder for "null"
//     await user.save();

//     res.status(200).json({ message: "OTP verified successfully" });

//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ message: "Error verifying OTP", error });
//   }
// };

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email (search both Admin and Staff models)
    let user = await Admin.findOne({ email });

    if (!user) {
      user = await Role.findOne({ email });
    }

    if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid OTP request" });
    }

    // Check if OTP matches and is not expired
    if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP fields after verification
    user.resetPasswordOTP = '';
    user.resetPasswordExpires = new Date(0); 
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Ensure passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find the user by email (search both Admin and Staff models)
    let user = await Admin.findOne({ email });

    if (!user) {
      user = await Role.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
};


export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.admin?.id;  // The ID of the authenticated admin from the token

    // Check if all fields are provided
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password must match" });
    }

    // Find the admin by their ID
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin's password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error });
  }
};



// export const createLocation = async (req: Request, res: Response) => {
//   try {
//     const { locationName, address, region, locationType, hourRate, firstName, lastName, email, mobileNumber, workType } = req.body;

//     // Validate required fields
//     if (!locationName || !address || !region || !hourRate || !firstName || !lastName || !email || !mobileNumber || !workType) {
//       return res.status(400).json({ message: "All required fields must be provided." });
//     }

//     const location = new Location({
//       locationName,
//       address,
//       region,
//       locationType: locationType || null, // Ensure optional field is handled correctly
//       hourRate,
//       firstName,
//       lastName,
//       email,
//       mobileNumber,
//       workType,
//     });

//     await location.save();
//     return res.status(201).json({ message: "Location created successfully", location });
//   } catch (error) {
//     return res.status(500).json({ message: "Error creating location", error: (error as Error).message });
//   }
// };

// Get All Locations

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { locationName, address, region, locationType, hourRate, firstName, lastName, email, mobileNumber, workType } = req.body;

    // Validate required fields
    if (!locationName || !address || !region || !hourRate || !firstName || !lastName || !email || !mobileNumber || !workType) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Validate email format
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate the region to ensure it's an array of valid states
    if (!Array.isArray(region) || !region.every(r => Object.values(USStates).includes(r))) {
      return res.status(400).json({ message: "Invalid region(s) provided." });
    }

    const location = new Location({
      locationName,
      address,
      region,
      locationType: locationType || null, // Optional field
      hourRate,
      firstName,
      lastName,
      email,
      mobileNumber,
      workType,
    });

    await location.save();
    return res.status(201).json({ message: "Location created successfully", location });
  } catch (error) {
    return res.status(500).json({ message: "Error creating location", error: (error as Error).message });
  }
};


export const getAllLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await Location.find();
    return res.status(200).json(locations);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching locations", error: (error as Error).message });
  }
};


