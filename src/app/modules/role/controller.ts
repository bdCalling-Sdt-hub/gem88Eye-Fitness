import { Request, Response } from "express";
import Role from "./role.model";
import bcrypt from "bcryptjs";
import { emailHelper } from "../../../helpers/emailHelper";
import jwt from "jsonwebtoken";


// export const assignRole = async (req: Request, res: Response) => {
//   try {
//     const { displayName, email, role, accessControls } = req.body;

//     // ✅ Check if the user already has a role
//     const existingRole = await Role.findOne({ email });
//     if (existingRole) {
//       return res.status(400).json({ message: "User already has a role assigned" });
//     }

//     // ✅ Create new role entry
//     const newRole = await Role.create({ displayName, email, role, accessControls });

//     // ✅ Send email notification
//     const emailContent = {
//       to: email,
//       subject: "New Role Assigned to Your Account",
//       html: `
//         <h3>Hello ${displayName},</h3>
//         <p>You have been assigned the role of <strong>${role}</strong> in our system.</p>
//         <p>Please set your password and access your account.</p>
//         <p> link href="http://10.0.70.208:8080/api/v1/staff/set-password">Set Password</p>
//         <p>Best Regards,</p>
//         <p>A New Fitness Team</p>
//       `,
//     };

//     await emailHelper.sendEmail(emailContent);

//     res.status(201).json({ message: "Role assigned successfully, email sent", newRole });
//   } catch (error) {
//     console.error("Error in assignRole:", error);
//     res.status(500).json({ message: "Error assigning role", error });
//   }
// };


export const assignRole = async (req: Request, res: Response) => {
  try {
    const { name, email, role, accessControls } = req.body;

    const existingRole = await Role.findOne({ email });
    if (existingRole) {
      return res.status(400).json({ message: "User already has a role assigned" });
    }

    const defaultAccessControls = [
      "calendar", "services", "invoice", "contact", 
      "reports", "payroll-reporting", "settings"
    ];

    let finalAccessControls = accessControls && Array.isArray(accessControls)
      ? accessControls.filter(page => defaultAccessControls.includes(page)) 
      : [];

    const newRole = await Role.create({
      name,
      email,
      role,
      accessControls: finalAccessControls.length ? finalAccessControls : defaultAccessControls, 
    });

    const emailContent = {
      to: email,
      subject: "New Role Assigned to Your Account",
      html: `
        <h3>Hello ${name},</h3>
        <p>You have been assigned the role of <strong>${role}</strong> in our system.</p>
        <p>Please set your password and access your account.</p>
        <p>Click the link to set your password: <a href="http://10.0.70.208:8080/api/v1/staff/set-password">Set Password</a></p>
        <p>Best Regards,</p>
        <p>A New Fitness Team</p>
      `,
    };

    await emailHelper.sendEmail(emailContent);

    res.status(201).json({ message: "Role assigned successfully, email sent", newRole });
  } catch (error) {
    console.error("Error in assignRole:", error);
    res.status(500).json({ message: "Error assigning role", error });
  }
};





export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ roles });
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", error });
  }
};




