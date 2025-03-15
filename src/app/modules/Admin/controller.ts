import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "./admin.model";
import {Location} from "./location.model"; 
import { USStates } from "../../../enums/location.enum";
import { isEmail } from 'validator';
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
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
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


