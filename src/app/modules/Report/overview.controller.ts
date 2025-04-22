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
// const getDateFilter = (filter: string) => {
//   const currentDate = new Date();
//   let startDate: Date;
//   let endDate: Date;

//   if (filter === "biweekly") {
//     const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
//     const currentWeek = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24 * 7));
//     const startWeek = new Date(startOfYear.getTime() + (currentWeek * 1000 * 3600 * 24 * 7));
//     startDate = new Date(startWeek);
//     endDate = new Date(startWeek.getTime() + (14 * 24 * 60 * 60 * 1000));
//   } else if (filter === "monthly") {
//     startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//     endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
//   } else if (filter === "yearly") {
//     startDate = new Date(currentDate.getFullYear(), 0, 1); 
//     endDate = new Date(currentDate.getFullYear() + 1, 0, 0); 
//   } else {
//     startDate = new Date("2000-01-01");
//     endDate = new Date();
//   }

//   startDate.setHours(0, 0, 0, 0);
//   endDate.setHours(23, 59, 59, 999); 

//   return { $gte: startDate, $lte: endDate };
// };

  
// export const getOverviewReport = async (req: Request, res: Response) => {
//     try {
//       const { filterType, instrtuctorName } = req.query;
  
//       const dateFilter = filterType ? getDateFilter(filterType as string) : {};
  
//       const searchQuery = instrtuctorName
//         ? {
//             $or: [
//               { staffName: { $regex: instrtuctorName, $options: "i" } },
//               { instructorName: { $regex: instrtuctorName, $options: "i" } },
//             ],
//           }
//         : {};
  
//       let paymentReports = await PaymentReport.find({
//         ...(filterType && { periodBeginning: dateFilter }),
//         ...searchQuery, 
//       });
  
//       let milesReports = await MilesReport.find({
//         ...(filterType && { createdAt: dateFilter }),
//         ...searchQuery, 
//       });
  
//       let overviewData = paymentReports.map((report) => {
//         const totalHours = report.workDetails.reduce((sum, work) => sum + work.hours, 0);
//         const totalWorkAmount = report.workDetails.reduce(
//           (sum, work) => sum + work.hours * work.hourRate,
//           0
//         );
//         const milesReport = milesReports.find((m) => m.staffName === report.staffName);
//         const totalMiles = milesReport
//           ? milesReport.milesDetails.reduce((sum: any, m: { miles: any; }) => sum + (m.miles || 0), 0)
//           : 0;
//         const mileageRate = milesReport
//           ? milesReport.milesDetails.reduce((sum: any, m: { mileRate: any; }) => sum + (m.mileRate || 0), 0) /
//             (milesReport.milesDetails.length || 1)
//           : 0;
  
//         return {
//           instructorName: report.staffName,
//           periodBeginning: report.periodBeginning,
//           periodEnding: report.periodEnding,
//           totalWorkingHours: totalHours,
//           totalWorkAmount,
//           totalMiles,
//           mileageRate,
//           totalAmount: totalWorkAmount + totalMiles * mileageRate,
//         };
//       });
  
//       return res.status(200).json({
//         message: "Overview report fetched successfully",
//         overviewData,
//       });
//     } catch (error) {
//       console.error("Error fetching overview report:", error);
//       return res.status(500).json({ message: "Error fetching overview report", error });
//     }
//   };
  export const getOverviewReport = async (req: Request, res: Response) => {
    try {
      const { filterType, instrtuctorName } = req.query;

      const getDateFilter = (filter: string) => {
        const currentDate = new Date();
        let startDate: Date;
        let endDate: Date;
  
        if (filter === "biweekly") {
          const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
          const currentWeek = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24 * 7));
          const startWeek = new Date(startOfYear.getTime() + (currentWeek * 1000 * 3600 * 24 * 7));
          startDate = new Date(startWeek);
          endDate = new Date(startWeek.getTime() + (14 * 24 * 60 * 60 * 1000));
        } else if (filter === "monthly") {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); 
        } else if (filter === "yearly") {
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          endDate = new Date(currentDate.getFullYear() + 1, 0, 0);
        } else {
          startDate = new Date(); 
          endDate = new Date();
        }
  
        return { $gte: startDate, $lte: endDate };
      };
  
      const dateFilter = filterType ? getDateFilter(filterType as string) : {};
  
      const searchQuery = instrtuctorName
      ? {
          $or: [
            { staffName: { $regex: instrtuctorName, $options: "i" } },
            { instructorName: { $regex: instrtuctorName, $options: "i" } },
          ],
        }
      : {};
  
      let paymentReports = await PaymentReport.find({
        ...(filterType && { periodBeginning: dateFilter }),
        ...searchQuery,
      });
      
      let milesReports = await MilesReport.find({
        ...(filterType && { createdAt: dateFilter }),
        ...searchQuery,
      });
      

      let overviewData = paymentReports.map((report) => {
        const totalHours = report.workDetails.reduce((sum, work) => sum + work.hours, 0);
        const totalWorkAmount = report.workDetails.reduce(
          (sum, work) => sum + work.hours * work.hourRate,
          0
        );

        const milesReport = milesReports.find((m) => m.staffName === report.staffName);
        const totalMiles = milesReport
          ? milesReport.milesDetails.reduce((sum: any, m: { miles: any; }) => sum + (m.miles || 0), 0)
          : 0;
        const mileageRate = milesReport
          ? milesReport.milesDetails.reduce((sum: any, m: { mileRate: any; }) => sum + (m.mileRate || 0), 0) /
            (milesReport.milesDetails.length || 1)
          : 0;
  
        return {
          instructorName: report.staffName,
          periodBeginning: report.periodBeginning,
          periodEnding: report.periodEnding,
          totalWorkingHours: totalHours,
          totalWorkAmount,
          totalMiles,
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
      const { year = '2025' } = req.query; 
  

      const totalClasses = await Class.countDocuments();
  

      const totalInstructors = await Staff.countDocuments(); 
  
    
      const paymentReports = await PaymentReport.find();
  

      const monthlyPayroll: { month: string; value: number; }[] = [];
      const monthlyClasses: {month: string; value: number; }[] = [];
      const monthlyInstructors: {month: string; value: number; }[] = [];
      const monthlyMiles: {month: string; value: number; }[] = [];
  
      const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
  
      monthNames.forEach((month) => {
        monthlyPayroll.push({ month, value: 0 });
        monthlyClasses.push({ month, value: 0 });
        monthlyInstructors.push({ month, value: 0 });
        monthlyMiles.push({ month, value: 0 });
      });
  
      let totalPayrollAmount = 0;
  
      paymentReports.forEach((report) => {
        if (report.workDetails) {  
          report.workDetails.forEach((work) => {
            const workDate = new Date(work.date);
            const monthIndex = workDate.getMonth(); 
  
            if (workDate.getFullYear() === parseInt(year as string)) { 
              const payrollAmount = work.hours * work.hourRate;
              totalPayrollAmount += payrollAmount;
  
      
              monthlyPayroll[monthIndex].value += payrollAmount;
              monthlyClasses[monthIndex].value += 1;  
              monthlyInstructors[monthIndex].value += 1;  
            }
          });
        }
      });
  
      const milesReports = await MilesReport.find();
  
      let totalMilesAmount = 0;
  
      milesReports.forEach((report) => {
        if (report.milesDetails) { 
          report.milesDetails.forEach((miles: { miles: number; mileRate: number; }) => {
            const milesAmount = miles.miles * miles.mileRate;
            totalMilesAmount += milesAmount;
  
            const milesDate = new Date(report.date);
            const monthIndex = milesDate.getMonth(); 
  
            if (milesDate.getFullYear() === parseInt(year as string)) {
              monthlyMiles[monthIndex].value += milesAmount;
            }
          });
        }
      });
  
      return res.status(200).json({
        success: true,
        message: 'All reports fetched successfully',
        totalClasses,
        totalInstructors,
        totalMilesAmount,
        totalPayrollAmount,
        paymentReports,
        milesReports,
        monthlyPayroll,    
        monthlyClasses,     
        monthlyInstructors,  
        monthlyMiles         
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      return res.status(500).json({ message: "Error fetching reports", error });
    }
  };
  
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
        report.milesDetails.forEach((miles: { miles: number; mileRate: number; }) => {
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
