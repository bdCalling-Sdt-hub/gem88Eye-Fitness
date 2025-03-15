import { Request, Response } from "express";
import PaymentReport from "./paymentReport.model";
import MilesReport from "./miles.model";
import { Parser } from "json2csv";


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


