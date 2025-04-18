import { NextFunction, Request, Response } from "express";
import PaymentReport from "./paymentReport.model";
import MilesReport from "./work.model/workdetails.model";
import { Parser } from "json2csv";
import Class from "../class/class.model";
import  Staff  from '../staff/staff.model'; 
import moment from 'moment';
// export const exportCSV = async (req: Request, res: Response) => {
//     try {
//       const { staffName, filterType } = req.query;
  
//       if (!staffName) {
//         return res.status(400).json({ message: "staffName query parameter is required" });
//       }
  
//       // Get date filter based on the provided type (biweekly, monthly, yearly)
//       const dateFilter = filterType ? getDateFilter(filterType as string) : {};
  
//       // Fetch Payment Reports
//       const paymentReports = await PaymentReport.find({
//         staffName: staffName,
//         ...(filterType && { periodBeginning: dateFilter }),
//       });
  
//       // Fetch Miles Reports
//       const milesReports = await MilesReport.find({
//         staffName: staffName,
//         ...(filterType && { createdAt: dateFilter }),
//       });
  
//       if (paymentReports.length === 0 && milesReports.length === 0) {
//         return res.status(404).json({ message: "No reports found for the given staffName" });
//       }
  
//       // Prepare CSV data
//       const csvData = paymentReports.map((report) => {
//         const totalWorkingHours = report.workDetails.reduce((sum, work) => sum + work.hours, 0);
//         const totalWorkAmount = report.workDetails.reduce(
//           (sum, work) => sum + work.hours * work.hourRate,
//           0
//         );
  
//         // Find corresponding miles report for the same instructor
//         const milesReport = milesReports.find((m) => m.staffName === report.staffName);
//         const totalMiles = milesReport
//           ? milesReport.milesDetails.reduce((sum, m) => sum + (m.miles || 0), 0)
//           : 0;
//         const mileageRate = milesReport
//           ? milesReport.milesDetails.reduce((sum, m) => sum + (m.mileRate || 0), 0) /
//             (milesReport.milesDetails.length || 1)
//           : 0;
  
//         return {
//           InstructorName: report.staffName,
//           PeriodBeginning: report.periodBeginning.toISOString(),
//           PeriodEnding: report.periodEnding.toISOString(),
//           TotalWorkingHours: totalWorkingHours,
//           TotalWorkAmount: totalWorkAmount.toFixed(2),
//           TotalMiles: totalMiles,
//           MileageRate: mileageRate.toFixed(2),
//           TotalAmount: (totalWorkAmount + totalMiles * mileageRate).toFixed(2),
//         };
//       });
  
//       // Convert JSON to CSV
//       const json2csvParser = new Parser({ fields: Object.keys(csvData[0]) });
//       const csv = json2csvParser.parse(csvData);
  
//       // Send response as downloadable CSV
//       res.setHeader("Content-Type", "text/csv");
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename=${staffName}_report.csv`
//       );
//       res.status(200).send(csv);
//     } catch (error) {
//       console.error("Error exporting CSV:", error);
//       return res.status(500).json({ message: "Error exporting CSV", error });
//     }
//   };

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
  
// export const getOverviewReport = async (req: Request, res: Response) => {
  //   try {
  //     const { filterType, instrtuctorName } = req.query;
  
  //     const dateFilter = filterType ? getDateFilter(filterType as string) : {};
  
      // const searchQuery = instrtuctorName
      //   ? {
      //       $or: [
      //         { staffName: { $regex: instrtuctorName, $options: "i" } },
      //         { instructorName: { $regex: instrtuctorName, $options: "i" } },
      //       ],
      //     }
      //   : {};
  
  //     let paymentReports = await PaymentReport.find({
  //       ...(filterType && { periodBeginning: dateFilter }),
  //       ...searchQuery, 
  //     });
  
  //     let milesReports = await MilesReport.find({
  //       ...(filterType && { createdAt: dateFilter }),
  //       ...searchQuery, 
  //     });
  
  //     let overviewData = paymentReports.map((report) => {
  //       const totalHours = report.workDetails.reduce((sum, work) => sum + work.hours, 0);
  //       const totalWorkAmount = report.workDetails.reduce(
  //         (sum, work) => sum + work.hours * work.hourRate,
  //         0
  //       );
  //       const milesReport = milesReports.find((m) => m.staffName === report.staffName);
  //       const totalMiles = milesReport
  //         ? milesReport.milesDetails.reduce((sum, m) => sum + (m.miles || 0), 0)
  //         : 0;
  //       const mileageRate = milesReport
  //         ? milesReport.milesDetails.reduce((sum, m) => sum + (m.mileRate || 0), 0) /
  //           (milesReport.milesDetails.length || 1)
  //         : 0;
  
  //       return {
  //         instructorName: report.staffName,
  //         periodBeginning: report.periodBeginning,
  //         periodEnding: report.periodEnding,
  //         totalWorkingHours: totalHours,
  //         totalWorkAmount,
  //         totalMiles,
  //         mileageRate,
  //         totalAmount: totalWorkAmount + totalMiles * mileageRate,
  //       };
  //     });
  
  //     return res.status(200).json({
  //       message: "Overview report fetched successfully",
  //       overviewData,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching overview report:", error);
  //     return res.status(500).json({ message: "Error fetching overview report", error });
  //   }
  // };
  // export const getOverviewReport = async (req: Request, res: Response) => {
  //   try {
  //     const { filterType, instrtuctorName } = req.query;
  
  //     // Define date filter function for different filter types
  //     const getDateFilter = (filter: string) => {
  //       const currentDate = new Date();
  //       let startDate: Date;
  //       let endDate: Date;
  
  //       if (filter === "biweekly") {
  //         const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  //         const currentWeek = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24 * 7));
  //         const startWeek = new Date(startOfYear.getTime() + (currentWeek * 1000 * 3600 * 24 * 7));
  //         startDate = new Date(startWeek);
  //         endDate = new Date(startWeek.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days later
  //       } else if (filter === "monthly") {
  //         startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  //         endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of the current month
  //       } else if (filter === "yearly") {
  //         startDate = new Date(currentDate.getFullYear(), 0, 1); // Start of the year
  //         endDate = new Date(currentDate.getFullYear() + 1, 0, 0); // End of the year
  //       } else {
  //         startDate = new Date(); // Default to current date
  //         endDate = new Date();
  //       }
  
  //       return { $gte: startDate, $lte: endDate };
  //     };
  
  //     // Create date filter based on filterType (biweekly, monthly, yearly)
  //     const dateFilter = filterType ? getDateFilter(filterType as string) : {};
  
  //     // Create search query for instructorName
  //     const searchQuery = instrtuctorName
  //     ? {
  //         $or: [
  //           { staffName: { $regex: instrtuctorName, $options: "i" } },
  //           { instructorName: { $regex: instrtuctorName, $options: "i" } },
  //         ],
  //       }
  //     : {};
  
  //     // Fetch Payment Reports based on filterType and search query
  //     let paymentReports = await PaymentReport.find({
  //       ...(filterType && { periodBeginning: dateFilter }),
  //       ...searchQuery,
  //     });
  
  //     // Fetch Miles Reports based on filterType and search query
  //     let milesReports = await MilesReport.find({
  //       ...(filterType && { createdAt: dateFilter }),
  //       ...searchQuery,
  //     });
  
  //     // Process data for overview
  //     let overviewData = paymentReports.map((report) => {
  //       const totalHours = report.workDetails.reduce((sum, work) => sum + work.hours, 0);
  //       const totalWorkAmount = report.workDetails.reduce(
  //         (sum, work) => sum + work.hours * work.hourRate,
  //         0
  //       );
  
  //       // Find corresponding miles report for the same instructor
  //       const milesReport = milesReports.find((m) => m.staffName === report.staffName);
  //       const totalMiles = milesReport
  //         ? milesReport.milesDetails.reduce((sum, m) => sum + (m.miles || 0), 0)
  //         : 0;
  //       const mileageRate = milesReport
  //         ? milesReport.milesDetails.reduce((sum, m) => sum + (m.mileRate || 0), 0) /
  //           (milesReport.milesDetails.length || 1)
  //         : 0;
  
  //       return {
  //         instructorName: report.staffName,
  //         periodBeginning: report.periodBeginning,
  //         periodEnding: report.periodEnding,
  //         totalWorkingHours: totalHours,
  //         totalWorkAmount,
  //         totalMiles,
  //         mileageRate,
  //         totalAmount: totalWorkAmount + totalMiles * mileageRate,
  //       };
  //     });
  
  //     return res.status(200).json({
  //       message: "Overview report fetched successfully",
  //       overviewData,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching overview report:", error);
  //     return res.status(500).json({ message: "Error fetching overview report", error });
  //   }
  // };
  
  // export const getAllReportsOV = async (req: Request, res: Response) => {
  //   try {

  //     const totalClasses = await Class.countDocuments();  
  

  //     const totalInstructors = await Staff.countDocuments(); // Counts all staff members (instructors)
  

  //     const paymentReports = await PaymentReport.find();
  

  //     const monthlyPayroll: Record<string, number> = {};
  //     const monthlyClasses: Record<string, number> = {};  
  //     const monthlyInstructors: Record<string, number> = {}; 
  //     const monthlyMiles: Record<string, number> = {}; 
  

  //     for (let month = 1; month <= 12; month++) {
  //       const monthStr = `2025-${month.toString().padStart(2, '0')}`;
  //       monthlyPayroll[monthStr] = 0;
  //       monthlyClasses[monthStr] = 0;
  //       monthlyInstructors[monthStr] = 0;
  //       monthlyMiles[monthStr] = 0;
  //     }
  
   
  //     let totalPayrollAmount = 0;
  
  //     paymentReports.forEach((report) => {
  //       report.workDetails.forEach((work) => {
  //         const workDate = new Date(work.date); 
  //         const yearMonth = `${workDate.getFullYear()}-${(workDate.getMonth() + 1).toString().padStart(2, '0')}`; // Format as "YYYY-MM"
  
  //         const payrollAmount = work.hours * work.hourRate;
  //         totalPayrollAmount += payrollAmount;
  
  //         if (monthlyPayroll[yearMonth] !== undefined) {
  //           monthlyPayroll[yearMonth] += payrollAmount;
  //         }
  

  //         if (monthlyClasses[yearMonth] !== undefined) {
  //           monthlyClasses[yearMonth] += 1;
  //         }
  
    
  //         if (monthlyInstructors[yearMonth] !== undefined) {
  //           monthlyInstructors[yearMonth] += 1;
  //         }
  //       });
  //     });
  //     const milesReports = await MilesReport.find();
  //     let totalMilesAmount = 0; 
  
  //     milesReports.forEach((report) => {
  //       report.milesDetails.forEach((miles) => {
  //         const milesAmount = miles.miles * miles.mileRate;
  //         totalMilesAmount += milesAmount;
  
  //         const milesDate = new Date(report.date); // Assuming there's a 'date' field in the miles report
  //         const yearMonth = `${milesDate.getFullYear()}-${(milesDate.getMonth() + 1).toString().padStart(2, '0')}`; // Format as "YYYY-MM"
  
  //         if (monthlyMiles[yearMonth] !== undefined) {
  //           monthlyMiles[yearMonth] += milesAmount;
  //         }
  //       });
  //     });
  
  //     // 6. Return the aggregated data
  //     return res.status(200).json({
  //       success: true,
  //       message: 'All reports fetched successfully',
  //       totalClasses,         // Total number of classes
  //       totalInstructors,     // Total number of instructors (staff)
  //       totalMilesAmount,     // Total miles amount (if applicable)
  //       totalPayrollAmount,   // Total payroll amount
  //       paymentReports,       // Payment reports data
  //       milesReports,         // Miles reports data
  //       monthlyPayroll,       // Monthly payroll breakdown with default 0 for all months
  //       monthlyClasses,       // Monthly classes breakdown with default 0 for all months
  //       monthlyInstructors,   // Monthly instructors breakdown with default 0 for all months
  //       monthlyMiles          // Monthly miles breakdown with default 0 for all months
  //     });
  //   } catch (error) {
  //     console.error("Error fetching reports:", error);
  //     return res.status(500).json({ message: "Error fetching reports", error });
  //   }
  // };
  // export const getAllReportsOV = async (req: Request, res: Response) => {
  //   try {
  //     const { year = '2025' } = req.query; // Get year from query (defaults to 2025)
  
  //     // 1. Get total number of classes
  //     const totalClasses = await Class.countDocuments();  
  
  //     // 2. Get total number of instructors (staff)
  //     const totalInstructors = await Staff.countDocuments(); // Counts all staff members (instructors)
  
  //     // 3. Get Payment Reports to calculate total payroll
  //     const paymentReports = await PaymentReport.find();
  
  //     // Initialize monthly breakdowns for payroll, classes, instructors, and miles
  //     const monthlyPayroll: { month: string; value: number; }[] = [];
  //     const monthlyClasses: {month: string; value: number; }[] = [];
  //     const monthlyInstructors: {month: string; value: number; }[] = [];
  //     const monthlyMiles: {month: string; value: number; }[] = [];
  
  //     // Array of month names for easy referencing
  //     const monthNames = [
  //       "January", "February", "March", "April", "May", "June", 
  //       "July", "August", "September", "October", "November", "December"
  //     ];
  
  //     // Initialize months for the selected year with default values of 0
  //     monthNames.forEach((month) => {
  //       monthlyPayroll.push({ month, value: 0 });
  //       monthlyClasses.push({ month, value: 0 });
  //       monthlyInstructors.push({ month, value: 0 });
  //       monthlyMiles.push({ month, value: 0 });
  //     });
  
  //     let totalPayrollAmount = 0;
  
  //     // 4. Process payment reports to calculate monthly payroll, classes, and instructors
  //     paymentReports.forEach((report) => {
  //       report.workDetails.forEach((work) => {
  //         const workDate = new Date(work.date);
  //         const monthIndex = workDate.getMonth(); // Get month index (0 for January, 1 for February, etc.)
  
  //         if (workDate.getFullYear() === parseInt(year as string)) { // Filter by selected year
  //           const payrollAmount = work.hours * work.hourRate;
  //           totalPayrollAmount += payrollAmount;
  
  //           // Update monthly payroll, classes, and instructors
  //           monthlyPayroll[monthIndex].value += payrollAmount;
  //           monthlyClasses[monthIndex].value += 1;  // Counting the class
  //           monthlyInstructors[monthIndex].value += 1;  // Counting the instructor
  //         }
  //       });
  //     });
  
  //     // 5. Get Miles Reports and calculate monthly miles
  //     const milesReports = await MilesReport.find();
  
  //     let totalMilesAmount = 0;
  
  //     milesReports.forEach((report) => {
  //       report.milesDetails.forEach((miles) => {
  //         const milesAmount = miles.miles * miles.mileRate;
  //         totalMilesAmount += milesAmount;
  
  //         const milesDate = new Date(report.date);
  //         const monthIndex = milesDate.getMonth(); // Get month index (0 for January, 1 for February, etc.)
  
  //         if (milesDate.getFullYear() === parseInt(year as string)) { // Filter by selected year
  //           // Update monthly miles for the selected year
  //           monthlyMiles[monthIndex].value += milesAmount;
  //         }
  //       });
  //     });
  
  //     // 6. Return the aggregated data as response
  //     return res.status(200).json({
  //       success: true,
  //       message: 'All reports fetched successfully',
  //       totalClasses,
  //       totalInstructors,
  //       totalMilesAmount,
  //       totalPayrollAmount,
  //       paymentReports,
  //       milesReports,
  //       monthlyPayroll,      // Array with monthly payroll values as objects
  //       monthlyClasses,      // Array with monthly class counts as objects
  //       monthlyInstructors,  // Array with monthly instructor counts as objects
  //       monthlyMiles         // Array with monthly miles values as objects
  //     });
  //   } catch (error) {
  //     console.error("Error fetching reports:", error);
  //     return res.status(500).json({ message: "Error fetching reports", error });
  //   }
  // };
  
  
  
  
  // export const exportReportsAsCSV = async (req: Request, res: Response, next: NextFunction) => {
  //   const { timePeriod } = req.query;  // bi-weekly, monthly, yearly
    
  //   try {
  //     let startDate: Date;
  //     let endDate: Date;
  
  //     // Set date range based on the selected time period
  //     if (timePeriod === 'bi-weekly') {
  //       startDate = moment().subtract(2, 'weeks').startOf('week').toDate();
  //       endDate = moment().toDate();
  //     } else if (timePeriod === 'monthly') {
  //       startDate = moment().startOf('month').toDate();
  //       endDate = moment().endOf('month').toDate();
  //     } else if (timePeriod === 'yearly') {
  //       startDate = moment().startOf('year').toDate();
  //       endDate = moment().endOf('year').toDate();
  //     } else {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid time period. Please use 'bi-weekly', 'monthly', or 'yearly'."
  //       });
  //     }
  
  //     // Fetch total classes, total instructors (staff), and payment reports within the date range
  //     const totalClasses = await Class.countDocuments(); // Counts all classes
  //     const totalInstructors = await Staff.countDocuments(); // Counts all staff members (instructors)
    
  //     const paymentReports = await PaymentReport.find({
  //       date: { $gte: startDate, $lte: endDate },
  //     });
  
  //     let totalPayrollAmount = 0;
  //     paymentReports.forEach((report) => {
  //       report.workDetails.forEach((work) => {
  //         totalPayrollAmount += work.hours * work.hourRate;
  //       });
  //     });
  
  //     const milesReports = await MilesReport.find({
  //       date: { $gte: startDate, $lte: endDate },
  //     });
  
  //     let totalMilesAmount = 0;
  //     milesReports.forEach((report) => {
  //       report.milesDetails.forEach((miles) => {
  //         totalMilesAmount += miles.miles * miles.mileRate;
  //       });
  //     });
  
  //     // Prepare CSV headers and the data for CSV export
  //     const reportData = [
  //       { "Total Classes": totalClasses, "Total Instructors": totalInstructors, "Total Payroll Amount": totalPayrollAmount, "Total Miles Amount": totalMilesAmount },
  //     ];
  
  //     // Prepare the CSV data
  //     const json2csvParser = new Parser();
  //     const csvData = json2csvParser.parse(reportData);
  
  //     // Set the headers for the CSV file download
  //     res.header('Content-Type', 'text/csv');
  //     res.attachment(`report-${timePeriod}.csv`);
  //     return res.send(csvData);
  
  //   } catch (error) {
  //     console.error("Error generating report:", error);
  //     return res.status(500).json({ message: "Error generating report", error });
  //   }
  // };
