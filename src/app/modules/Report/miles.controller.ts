// import { Request, Response } from "express";
// import MilesReport from "./work.model/workdetails.model";
// import Staff from "../staff/staff.model";
// import {Location} from "../Admin/location.model"; // Assuming miles are tracked here
// import PaymentReport from "./paymentReport.model";
// import Lead from "../contact/leads.model";
// import milesdetails from "./";
// export const createMilesReport = async (req: Request, res: Response) => {
//     try {
//       const { staffName, periodBeginning, periodEnding, milesDetails } = req.body;
  
//       if (!milesDetails || milesDetails.length === 0) {
//         return res.status(400).json({ message: "Miles details are required" });
//       }
  
//       const milesReport = new MilesReport({
//         staffName,
//         periodBeginning,
//         periodEnding,
//         milesDetails,
//       });
  
//       await milesReport.save();
//       return res.status(201).json({ message: "Miles report created successfully", milesReport });
//     } catch (error) {
//       console.error("Error creating miles report:", error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };


//   // export const getAllReports = async (req: Request, res: Response) => {
//   //   try {
//   //     // Fetch all Payment Reports
//   //     const paymentReports = await PaymentReport.find();
  
//   //     // Calculate total payment amount
//   //     let totalPaymentAmount = 0;
//   //     paymentReports.forEach((report) => {
//   //       report.workDetails.forEach((work) => {
//   //         totalPaymentAmount += work.hours * work.hourRate;
//   //       });
//   //     });
  
//   //     // Fetch all Miles Reports
//   //     const milesReports = await MilesReport.find();
  
//   //     // Calculate total miles amount
//   //     let totalMilesAmount = 0;
//   //     milesReports.forEach((report) => {
//   //       report.milesDetails.forEach((miles) => {
//   //         totalMilesAmount += miles.miles * miles.mileRate;
//   //       });
//   //     });
  
//   //     // Response JSON
//   //     return res.status(200).json({
//   //       message: "All reports fetched successfully",
//   //       totalPaymentAmount,
//   //       totalMilesAmount,
//   //       paymentReports,
//   //       milesReports,
//   //     });
//   //   } catch (error) {
//   //     console.error("Error fetching reports:", error);
//   //     return res.status(500).json({ message: "Error fetching reports", error });
//   //   }
//   // };
  
//   export const getAllReports = async (req: Request, res: Response) => {
//     try {
//       // Fetch all Payment Reports
//       const paymentReports = await PaymentReport.find();
  
//       // Store individual instructor details
//       let instructorDetails: any[] = [];
  
//       // Calculate total payment amount and individual instructor details
//       paymentReports.forEach((report) => {
//         report.workDetails.forEach((work) => {
//           const instructor = instructorDetails.find(
//             (instructor) => instructor.name === report.staffName
//           );
  
//           // If instructor is not found, create new entry for them
//           if (!instructor) {
//             instructorDetails.push({
//               name: report.staffName,
//               periodBeginning: report.periodBeginning, // Assign period beginning
//               periodEnding: report.periodEnding, // Assign period ending
//               totalWorkingHours: 0,
//               totalWorkingAmount: 0,
//               totalMiles: 0,
//               mileageRate: 0,
//               totalAmount: 0,
//             });
//           }
  
//           // Find the instructor again after possible addition
//           const instructorUpdated = instructorDetails.find(
//             (instructor) => instructor.name === report.staffName
//           );
  
//           // Add the work details to the instructor
//           if (instructorUpdated) {
//             instructorUpdated.totalWorkingHours += work.hours;
//             instructorUpdated.totalWorkingAmount += work.hours * work.hourRate;
//           }
//         });
//       });
  
//       // Fetch all Miles Reports
//       const milesReports = await MilesReport.find();
  
//       // Calculate total miles amount and update instructor details
//       milesReports.forEach((report) => {
//         report.milesDetails.forEach((miles) => {
//           const instructor = instructorDetails.find(
//             (instructor) => instructor.name === report.staffName
//           );
  
//           // If instructor exists, add miles information
//           if (instructor) {
//             instructor.totalMiles += miles.miles;
//             instructor.mileageRate = miles.mileRate; // Assuming mileRate is consistent
//             instructor.totalAmount += miles.miles * miles.mileRate;
//           }
//         });
//       });
  
//       // Calculate total payment and miles amount
//       let totalPaymentAmount = 0;
//       let totalMilesAmount = 0;
  
//       instructorDetails.forEach((instructor) => {
//         totalPaymentAmount += instructor.totalWorkingAmount;
//         totalMilesAmount += instructor.totalAmount;
//       });
  
//       // Response JSON
//       return res.status(200).json({
//         message: "All reports fetched successfully",
//         totalPaymentAmount,
//         totalMilesAmount,
//         instructorDetails, // Instructor details now include period beginning and ending
//       });
//     } catch (error) {
//       console.error("Error fetching reports:", error);
//       return res.status(500).json({ message: "Error fetching reports", error });
//     }
//   };
  
  
  
  
  