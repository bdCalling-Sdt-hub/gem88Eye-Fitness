import { NextFunction, Request, Response } from "express";
import PaymentReport from "./paymentReport.model";
import MilesReport from "./work.model/workdetails.model";
import { Parser } from "json2csv";
import Class from "../class/class.model";
import  Staff  from '../staff/staff.model'; 
import moment from 'moment';
import WorkDetails from "./work.model/workdetails.model";
import Instructor from "./work.model/instructor.model";
import MilesDetails from "./work.model/miles.model";
import { Location } from "../Admin/location.model"; 

export const getOverviewReport = async (req: Request, res: Response) => {
  try {
    const { filterType, instructorName } = req.query;

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

    // Debug log to verify the query
    console.log("Date filter:", dateFilter);
    
    // First, get all instructors matching the search criteria
    const instructorQuery = instructorName 
      ? { instructorName: { $regex: instructorName, $options: "i" } }
      : {};

    // Get all instructors with their staff references populated
    // Modified to properly populate the Staff model
    const instructors = await Instructor.find({
      ...(filterType && { periodBeginning: dateFilter }),
      ...instructorQuery
    }).populate('instructorName');
    
    // Debug log to check what's being returned from the instructor query
    console.log("Instructors found:", instructors.length);
    console.log("First instructor:", instructors[0] ? JSON.stringify(instructors[0]) : "None");
    
    // Get all work details for these instructors
    const workDetailsPromises = instructors.map(instructor => 
      WorkDetails.find({ instructor: instructor._id })
    );
    const allWorkDetails = await Promise.all(workDetailsPromises);
    
    // Get all miles details for these instructors
    const milesDetailsPromises = instructors.map(instructor => 
      MilesDetails.find({ instructor: instructor._id })
    );
    const allMilesDetails = await Promise.all(milesDetailsPromises);

    // Combine the data for each instructor
    let overviewData = instructors.map((instructor, index) => {
      const workDetails = allWorkDetails[index];
      const milesDetails = allMilesDetails[index];
      
      // Debug the instructor object to see what's available
      console.log(`Instructor ${index} data:`, {
        id: instructor._id,
        instructorNameRef: instructor.instructorName,
        periodBeginning: instructor.periodBeginning
      });
      
      // Calculate total work hours and amount
      const totalHours = workDetails.reduce((sum, work) => 
        sum + work.workDetails.hours, 0);
      
      const totalWorkAmount = workDetails.reduce((sum, work) => 
        sum + (work.workDetails.hours * work.workDetails.hourRate), 0);
      
      // Calculate total miles and average mile rate
      const totalMiles = milesDetails.reduce((sum, miles) => 
        sum + (miles.milesDetails.miles || 0), 0);
      
      const mileageRates = milesDetails
        .filter(m => m.milesDetails.mileRate)
        .map(m => m.milesDetails.mileRate);
      
      const mileageRate = mileageRates.length > 0 
        ? mileageRates.reduce((sum, rate) => sum + rate, 0) / mileageRates.length 
        : 0;
      
      // Extract staff name handling different possible shapes of data
      let staffName = 'Unknown';
      
      if (instructor.instructorName) {
        if (typeof instructor.instructorName === 'string') {
          // If it's just a string ID
          staffName = instructor.instructorName;
        } else if (typeof instructor.instructorName === 'object') {
          // If it's a populated object
          if ('name' in instructor.instructorName) {
            staffName = instructor.instructorName.name as string;
          } else if ('firstName' in instructor.instructorName && 'lastName' in instructor.instructorName) {
            staffName = `${instructor.instructorName.firstName} ${instructor.instructorName.lastName}`;
          } else {
            // Try to get any field that might contain a name
            const possibleNameFields = ['fullName', 'displayName', 'username', '_id'];
            for (const field of possibleNameFields) {
              if (typeof instructor.instructorName === 'object' && field in (instructor.instructorName as unknown as Record<string, unknown>) && (instructor.instructorName as unknown as Record<string, unknown>)[field]) {
                staffName = typeof instructor.instructorName === 'object' && field in instructor.instructorName
                  ? ((instructor.instructorName as unknown) as Record<string, unknown>)[field] as string
                  : staffName;
                break;
              }
            }
          }
        }
      }

      return {
        instructorName: staffName,
        instructorId: instructor._id,
        periodBeginning: instructor.periodBeginning,
        periodEnding: instructor.periodEnding,
        totalWorkingHours: totalHours,
        totalWorkAmount,
        totalMiles,
        mileageRate,
        totalAmount: totalWorkAmount + (totalMiles * mileageRate),
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
