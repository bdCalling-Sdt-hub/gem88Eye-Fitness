import { Request, Response } from "express";
import Staff from "./staff.model";
import mongoose from "mongoose";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Role from "../role/role.model";
import path from "path";
import { emailHelper } from "../../../helpers/emailHelper";


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

      // Check if files exist under the "doc" field and get the first file path
      let document: string | null = null;

      if (req.files && "documents" in req.files) {
        // Get the first file (since only one file is allowed)
        const file = (req.files["documents"] as Express.Multer.File[])[0];

        // Use path to get a relative path for the file
        document = `/uploads/documents/${file.filename}`;
      }

      // Create a new staff record with the document path
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

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { status } = req.query; // Optional filter: "valid" or "invalid"

    // Build the filter based on the query parameter
    let filter = {};
    if (status === "valid") {
      filter = { status: "valid" }; // Assuming `status` is the field that indicates validity
    } else if (status === "invalid") {
      filter = { status: "invalid" };
    }

    // Find all staff with the filter and include `documents` field
    const staff = await Staff.find(filter).select("name status documents expiryDate role createdAt");

    // Make sure document paths are accessible via the base URL
    const staffWithDocumentPaths = staff.map((staffMember) => ({
      ...staffMember.toObject(),
      documents: staffMember.documents ? `${staffMember.documents}` : null,  // Ensure correct path format
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
    // Handle image upload first using multer
    upload(req, res, async (err: any) => {
      if (err) {
        // Handle file upload errors
        return res.status(400).json({ message: err.message });
      }
  
      try {
        const { staffId } = req.params;
        const { name, expiryDate, businessName, address } = req.body;
  
        const staff = await Staff.findById(staffId);
        if (!staff) {
          return res.status(404).json({ message: "Staff not found" });
        }
  
        // Update staff fields if provided
        if (name) staff.name = name;
        if (expiryDate) staff.expiryDate = expiryDate;
        if (businessName) staff.businessName = businessName;
        if (address) staff.address = address;
  
        // If an image is uploaded, save the file path to the database
        if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })['image']) {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const imagePath = '/uploads/image/' + files['image'][0].filename;  // Image path
          staff.image = imagePath;
        }
  
        // Save the updated staff document
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
  
      // ✅ Check if user exists
      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Ensure user has a password set before comparing
      if (!user.password) {
        return res.status(400).json({ message: "User does not have a password set" });
      }
  
      // ✅ Compare the password securely
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // ✅ Generate JWT token
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
      // The user is already attached to req by the authenticateUser middleware
      const userId = req.user.id;  // This is set by the authenticateUser middleware
  
      // Fetch the user from the database using the decoded user ID
      const user = await Role.findById(userId).select('-password');  // Exclude password from the result
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send back the user profile data (exclude sensitive fields like password)
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
    // Handle image file upload first using multer
    upload(req, res, async (err: any) => {
      if (err) {
        // Handle file upload errors (e.g., file size, type issues)
        return res.status(400).json({ message: err.message });
      }
  
      try {
        const { name, email,businessName,address, password } = req.body;
        const user = req.user; 
  
        // Prepare an object to store the updated data
        const updatedUserData: any = {};
  
        // If displayName is provided, update it
        if (name) {
          updatedUserData.name = name;
        }
  
        // If email is provided, update it
        if (email) {
          updatedUserData.email = email;
        }

        if (businessName) {
          updatedUserData.businessName = businessName;
        }

        if (address) {
          updatedUserData.address = address;
        }
  
        // If password is provided, hash it and update
        if (password) {
          const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));  // Hash password
          updatedUserData.password = hashedPassword;
        }
  
        // If an image is uploaded, save the file path to the database
        if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })['image']) {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const imagePath = '/uploads/image/' + files['image'][0].filename;  
          updatedUserData.image = imagePath;
        }
  
        // Update the user's profile in the database
        const updatedUser = await Role.findByIdAndUpdate(user.id, updatedUserData, {
          new: true,  // Return updated document
          runValidators: true,  // Ensure validators are applied (e.g., email uniqueness)
        });
  
        // If user not found, return an error
        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        // Send the updated user data as a response (excluding password)
        const userProfile = {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          businessName: updatedUser.businessName,
          address: updatedUser.address,
          role: updatedUser.role,
          accessControls: updatedUser.accessControls,
          image: updatedUser.image || 'https://i.ibb.co/z5YHLV9/profile.png',  // Default image if not uploaded
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
  
      // ✅ Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      // ✅ Check if user exists
      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // ✅ Update user password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Error in setPassword:", error);
      res.status(500).json({ message: "Error setting password", error });
    }
  };

  //staff forget password
  export const forgetPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
  
      // Check if user exists
      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Generate a random 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  
      // Save OTP and expiry in the database
      user.resetPasswordOTP = otp;
      user.resetPasswordExpires = otpExpires;
      await user.save();
  
      // Send OTP via email
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
  
      // Find user by email
      const user = await Role.findOne({ email });
      if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
        return res.status(400).json({ message: "Invalid OTP request" });
      }
  
      // Check if OTP matches and is not expired
      if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
  
      // Clear OTP fields after verification
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
  
      // Ensure passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      // Find user by email
      const user = await Role.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error resetting password", error });
    }
  };
  
  
