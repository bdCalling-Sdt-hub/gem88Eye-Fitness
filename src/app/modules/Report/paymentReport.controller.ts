import { Request, Response } from "express";
import PaymentReport from "./paymentReport.model";
import Staff from "../staff/staff.model";
import {Location} from "../Admin/location.model"; // Assuming you have a location model

// Function to get the date range (current date to two weeks later)
const getReportPeriod = () => {
  const today = new Date();
  const periodBeginning = new Date(today);
  const periodEnding = new Date(today);
  periodEnding.setDate(periodEnding.getDate() + 14); // Two weeks later
  return { periodBeginning, periodEnding };
};

// Generate Payment Report
// export const generatePaymentReport = async (req: Request, res: Response) => {
//   try {
//     // Get the staff details
//     const staffMembers = await Staff.find();

//     if (!staffMembers.length) {
//       return res.status(404).json({ message: "No staff members found." });
//     }

//     const { periodBeginning, periodEnding } = getReportPeriod();
//     const reports = [];

//     for (const staff of staffMembers) {
//       // Fetch work details from the location model (assuming work details are stored there)
//       const workDetails = await Location.find({ staffName: staff.name });

//       // Format work data for the report
//       const formattedWorkDetails = workDetails.map((work) => ({
//         date: work.date,
//         workDescription: work.description,
//         hours: work.hours,
//         hourRate: work.hourRate,
//         workType: work.workType, // Either "online" or "offline"
//       }));

//       // Create report entry
//       const report = new PaymentReport({
//         staffName: staff.name,
//         periodBeginning,
//         periodEnding,
//         workDetails: formattedWorkDetails,
//       });

//       await report.save();
//       reports.push(report);
//     }

//     return res.status(201).json({
//       message: "Payment reports generated successfully.",
//       reports,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Error generating reports",error});
//   }
// };

export const createPaymentReport = async (req: Request, res: Response) => {
  try {
    const { staffName, periodBeginning, periodEnding, workDetails } = req.body;

    if (!workDetails || workDetails.length === 0) {
      return res.status(400).json({ message: "Work details are required" });
    }

    const paymentReport = new PaymentReport({
      staffName,
      periodBeginning,
      periodEnding,
      workDetails,
    });

    await paymentReport.save();
    return res.status(201).json({ message: "Payment report created", paymentReport });
  } catch (error) {
    console.error("Error creating payment report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

