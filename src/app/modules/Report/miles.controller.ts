import { Request, Response } from "express";
import MilesReport from "./miles.model";
import Staff from "../staff/staff.model";
import {Location} from "../Admin/location.model"; // Assuming miles are tracked here
import PaymentReport from "./paymentReport.model";

export const createMilesReport = async (req: Request, res: Response) => {
    try {
      const { staffName, periodBeginning, periodEnding, milesDetails } = req.body;
  
      if (!milesDetails || milesDetails.length === 0) {
        return res.status(400).json({ message: "Miles details are required" });
      }
  
      const milesReport = new MilesReport({
        staffName,
        periodBeginning,
        periodEnding,
        milesDetails,
      });
  
      await milesReport.save();
      return res.status(201).json({ message: "Miles report created successfully", milesReport });
    } catch (error) {
      console.error("Error creating miles report:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };


  export const getAllReports = async (req: Request, res: Response) => {
    try {
      // Fetch all Payment Reports
      const paymentReports = await PaymentReport.find();
  
      // Calculate total payment amount
      let totalPaymentAmount = 0;
      paymentReports.forEach((report) => {
        report.workDetails.forEach((work) => {
          totalPaymentAmount += work.hours * work.hourRate;
        });
      });
  
      // Fetch all Miles Reports
      const milesReports = await MilesReport.find();
  
      // Calculate total miles amount
      let totalMilesAmount = 0;
      milesReports.forEach((report) => {
        report.milesDetails.forEach((miles) => {
          totalMilesAmount += miles.miles * miles.mileRate;
        });
      });
  
      // Response JSON
      return res.status(200).json({
        message: "All reports fetched successfully",
        totalPaymentAmount,
        totalMilesAmount,
        paymentReports,
        milesReports,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      return res.status(500).json({ message: "Error fetching reports", error });
    }
  };
  