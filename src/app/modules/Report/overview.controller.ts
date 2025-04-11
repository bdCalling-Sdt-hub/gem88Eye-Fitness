import { NextFunction, Request, Response } from "express";
import PaymentReport from "./paymentReport.model";
import MilesReport from "./miles.model";
import { Parser } from "json2csv";
import Class from "../class/class.model";
import  Staff  from '../staff/staff.model'; 
import moment from 'moment';
export const exportCSV = async (req: Request, res: Response) => {
    try {
      const { staffName, filterType } = req.query;
  
      if (!staffName) {
        return res.status(400).json({ message: "staffName query parameter is required" });
      }
  
      // Get date filter based on the provided type (biweekly, monthly, yearly)
      const dateFilter = filterType ? getDateFilter(filterType as string) : {};
  
      // Fetch Payment Reports
      const paymentReports = await PaymentReport.find({
        staffName: staffName,
        ...(filterType && { periodBeginning: dateFilter }),
      });
  
      // Fetch Miles Reports
      const milesReports = await MilesReport.find({
        staffName: staffName,
        ...(filterType && { createdAt: dateFilter }),
      });
  
      if (paymentReports.length === 0 && milesReports.length === 0) {
        return res.status(404).json({ message: "No reports found for the given staffName" });
      }
  
      // Prepare CSV data
      const csvData = paymentReports.map((report) => {
        const totalWorkingHours = report.workDetails.reduce((sum, work) => sum + work.hours, 0);
        const totalWorkAmount = report.workDetails.reduce(
          (sum, work) => sum + work.hours * work.hourRate,
          0
        );
  
        // Find corresponding miles report for the same instructor
        const milesReport = milesReports.find((m) => m.staffName === report.staffName);
        const totalMiles = milesReport
          ? milesReport.milesDetails.reduce((sum, m) => sum + (m.miles || 0), 0)
          : 0;
        const mileageRate = milesReport
          ? milesReport.milesDetails.reduce((sum, m) => sum + (m.mileRate || 0), 0) /
            (milesReport.milesDetails.length || 1)
          : 0;
  
        return {
          InstructorName: report.staffName,
          PeriodBeginning: report.periodBeginning.toISOString(),
          PeriodEnding: report.periodEnding.toISOString(),
          TotalWorkingHours: totalWorkingHours,
          TotalWorkAmount: totalWorkAmount.toFixed(2),
          TotalMiles: totalMiles,
          MileageRate: mileageRate.toFixed(2),
          TotalAmount: (totalWorkAmount + totalMiles * mileageRate).toFixed(2),
        };
      });
  
      // Convert JSON to CSV
      const json2csvParser = new Parser({ fields: Object.keys(csvData[0]) });
      const csv = json2csvParser.parse(csvData);
  
      // Send response as downloadable CSV
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${staffName}_report.csv`
      );
      res.status(200).send(csv);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      return res.status(500).json({ message: "Error exporting CSV", error });
    }
  };

// Function to filter reports based on time range
const getDateFilter = (filterType: string) => {
    const now = new Date();
    let startDate: Date, endDate: Date;
  
    switch (filterType) {
      case "biweekly":
        startDate = new Date(now.setDate(now.getDate() - 14)); // Last 2 weeks
        break;
      case "monthly":
        startDate = new Date(now.setMonth(now.getMonth() - 1)); // Last month
        break;
      case "yearly":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)); // Last year
        break;
      default:
        startDate = new Date("2000-01-01"); // Fetch all if no filter
    }
    endDate = new Date(); // Up to today
  
    return { $gte: startDate, $lte: endDate };
  };
  
  export const getOverviewReport = async (req: Request, res: Response) => {
    try {
      const { filterType, search } = req.query;
  
      // Create a filter for date range (biweekly, monthly, yearly)
      const dateFilter = filterType ? getDateFilter(filterType as string) : {};
  
      // Fetch Payment Reports based on filter
      let paymentReports = await PaymentReport.find({
        ...(filterType && { periodBeginning: dateFilter }),
        ...(search && { staffName: { $regex: search, $options: "i" } }), // Search by name (case-insensitive)
      });
  
      // Fetch Miles Reports based on filter
      let milesReports = await MilesReport.find({
        ...(filterType && { createdAt: dateFilter }),
        ...(search && { staffName: { $regex: search, $options: "i" } }),
      });
  
      // Process data for overview
      let overviewData = paymentReports.map((report) => {
        const totalHours = report.workDetails.reduce((sum, work) => sum + work.hours, 0);
        const totalWorkAmount = report.workDetails.reduce(
          (sum, work) => sum + work.hours * work.hourRate,
          0
        );
  
        // Find corresponding miles report for the same instructor
        const milesReport = milesReports.find((m) => m.staffName === report.staffName);
        const totalMiles = milesReport
          ? milesReport.milesDetails.reduce((sum, m) => sum + (m.miles || 0), 0)
          : 0;
        const mileageRate = milesReport
          ? milesReport.milesDetails.reduce((sum, m) => sum + (m.mileRate || 0), 0) /
            (milesReport.milesDetails.length || 1)
          : 0;
  
        return {
          instructorName: report.staffName,
          periodBeginning: report.periodBeginning,
          periodEnding: report.periodEnding,
          totalWorkingHours: totalHours,
          totalWorkAmount,
          totalMiles, // Now properly included in the type
          mileageRate,
          totalAmount: totalWorkAmount + totalMiles * mileageRate,
        };
      });
  
      return res.status(200).json({
        message: "Overview report fetched successfully",
        overviewData,
      });
    } catch (error) {
      console.error("Error fetching overview report:", error);
      return res.status(500).json({ message: "Error fetching overview report", error });
    }
  };

  export const getAllReportsOV = async (req: Request, res: Response) => {
    try {
      // 1. Get total number of classes
      const totalClasses = await Class.countDocuments();  // Counts all classes
  
      // 2. Get total number of instructors (staff)
      const totalInstructors = await Staff.countDocuments(); // Counts all staff members (instructors)
  
      // 3. Get all Payment Reports to calculate total payroll
      const paymentReports = await PaymentReport.find();
  
      // Calculate total payroll amount
      let totalPayrollAmount = 0;
      paymentReports.forEach((report) => {
        report.workDetails.forEach((work) => {
          totalPayrollAmount += work.hours * work.hourRate; // Summing hours * hourly rate for payroll calculation
        });
      });
  
      // 4. Calculate total miles amount (if applicable)
      const milesReports = await MilesReport.find(); // Assuming you have MilesReport model
  
      let totalMilesAmount = 0;
      milesReports.forEach((report) => {
        report.milesDetails.forEach((miles) => {
          totalMilesAmount += miles.miles * miles.mileRate; // Summing miles * mile rate for miles calculation
        });
      });
  
      // 5. Return the aggregated data
      return res.status(200).json({
        success: true,
        message: 'All reports fetched successfully',
        totalClasses,         // Total number of classes
        totalPayrollAmount,   // Total payroll amount
        totalInstructors,     // Total number of instructors (staff)
        totalMilesAmount,     // Total miles amount (if applicable)
        paymentReports,       // Payment reports data
        milesReports,         // Miles reports data
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      return res.status(500).json({ message: "Error fetching reports", error });
    }
  };

  //csv report home page
  export const exportReportsAsCSV = async (req: Request, res: Response, next: NextFunction) => {
    const { timePeriod } = req.query;  // bi-weekly, monthly, yearly
    
    try {
      let startDate: Date;
      let endDate: Date;
  
      // Set date range based on the selected time period
      if (timePeriod === 'bi-weekly') {
        startDate = moment().subtract(2, 'weeks').startOf('week').toDate();
        endDate = moment().toDate();
      } else if (timePeriod === 'monthly') {
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
      } else if (timePeriod === 'yearly') {
        startDate = moment().startOf('year').toDate();
        endDate = moment().endOf('year').toDate();
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid time period. Please use 'bi-weekly', 'monthly', or 'yearly'."
        });
      }
  
      // Fetch total classes, total instructors (staff), and payment reports within the date range
      const totalClasses = await Class.countDocuments(); // Counts all classes
      const totalInstructors = await Staff.countDocuments(); // Counts all staff members (instructors)
    
      const paymentReports = await PaymentReport.find({
        date: { $gte: startDate, $lte: endDate },
      });
  
      let totalPayrollAmount = 0;
      paymentReports.forEach((report) => {
        report.workDetails.forEach((work) => {
          totalPayrollAmount += work.hours * work.hourRate;
        });
      });
  
      const milesReports = await MilesReport.find({
        date: { $gte: startDate, $lte: endDate },
      });
  
      let totalMilesAmount = 0;
      milesReports.forEach((report) => {
        report.milesDetails.forEach((miles) => {
          totalMilesAmount += miles.miles * miles.mileRate;
        });
      });
  
      // Prepare CSV headers and the data for CSV export
      const reportData = [
        { "Total Classes": totalClasses, "Total Instructors": totalInstructors, "Total Payroll Amount": totalPayrollAmount, "Total Miles Amount": totalMilesAmount },
      ];
  
      // Prepare the CSV data
      const json2csvParser = new Parser();
      const csvData = json2csvParser.parse(reportData);
  
      // Set the headers for the CSV file download
      res.header('Content-Type', 'text/csv');
      res.attachment(`report-${timePeriod}.csv`);
      return res.send(csvData);
  
    } catch (error) {
      console.error("Error generating report:", error);
      return res.status(500).json({ message: "Error generating report", error });
    }
  };
