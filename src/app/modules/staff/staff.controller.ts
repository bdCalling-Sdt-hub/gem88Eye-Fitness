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
// ➤ CREATE A NEW STAFF MEMBER WITH FILE UPLOAD
export const createStaff = async (req: Request, res: Response) => {
    fileUploadHandler()(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload error", error: err });
      }
  
      try {
        const { name, expiryDate } = req.body;
  
        // Extract relative file paths
        const documents = req.files && "doc" in req.files
          ? (req.files["doc"] as Express.Multer.File[]).map((file) => 
              path.relative(process.cwd(), file.path) // ✅ Convert to relative path
            )
          : [];
  
        const staff = new Staff({ name, documents, expiryDate });
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
  
  

// ➤ GET ALL STAFF MEMBERS
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { status } = req.query; // Optional filter: "valid" or "invalid"

    let filter = {};
    if (status === "valid") {
      filter = { isValid: true };
    } else if (status === "invalid") {
      filter = { isValid: false };
    }

    const staff = await Staff.find(filter);

    res.status(200).json({
      message: "Staff retrieved successfully",
      staff,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff", error });
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
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error in staffLogin:", error);
      res.status(500).json({ message: "Error logging in", error});
    }
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
  
  
