import { Request, Response } from 'express';
import InstructorDetails from './instructor.model';
import WorkDetails from './workdetails.model';
import MilesDetails from './miles.model';
import { IInstructor } from './instructor.model';
import mongoose from 'mongoose';
import { populate } from 'dotenv';
import moment from 'moment';


const isDateWithinPeriod = async (instructorId: string, workDate: Date): Promise<boolean> => {
  try {
    const instructor = await mongoose.model('Instructor').findById(instructorId);
    
    if (!instructor) {
      throw new Error("Instructor not found");
    }
    
    const periodBeginning = new Date(instructor.periodBeginning);
    const periodEnding = new Date(instructor.periodEnding);
    const date = new Date(workDate);
    
    // Normalize to UTC if the dates are timezone sensitive
    periodBeginning.setUTCHours(0, 0, 0, 0); // Set the start to midnight UTC
    periodEnding.setUTCHours(23, 59, 59, 999); // Set the end to the last millisecond of the day in UTC
    date.setUTCHours(0, 0, 0, 0); // Normalize work date

    return date >= periodBeginning && date <= periodEnding;
  } catch (error) {
    console.error("Error checking date validity:", error);
    throw error;
  }
};

export const createInstructor = async (req: Request, res: Response) => {
    try {
      const { periodBeginning, periodEnding, instructorName } = req.body;
  
      const newInstructor = new InstructorDetails({
        periodBeginning,
        periodEnding,
        instructorName, 
      });

      await newInstructor.save();
      const populatedInstructor = await newInstructor.populate('instructorName');
  
      return res.status(201).json(populatedInstructor);  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating instructor' });
    }
  };
  
export const getInstructors = async (req: Request, res: Response) => {
    try {
     
      const instructors = await InstructorDetails.find()
        .populate('instructorName')  
        .exec();
  
      return res.status(200).json(instructors);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching instructors' });
    }
  };

  export const getInstructorById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const instructor = await InstructorDetails.findById(id).populate('instructorName');
  
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
  
      return res.status(200).json(instructor);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error retrieving instructor' });
    }
  };
  
const isTwoWeeksLimitReached = async (instructorId: mongoose.Types.ObjectId) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); 
  
   
    const workCount = await WorkDetails.countDocuments({
      instructor: instructorId,
      'workDetails.date': { $gte: twoWeeksAgo },
    });
  
    const milesCount = await MilesDetails.countDocuments({
      'milesDetails.date': { $gte: twoWeeksAgo },
    });
  
    return workCount + milesCount >= 14; 
  };
  
export const createWorkDetails = async (req: Request, res: Response) => {
    try {
      const { instructorId, workDetails } = req.body;
  
      const limitReached = await isTwoWeeksLimitReached(instructorId);
      if (limitReached) {
        return res.status(400).json({ message: "Two-week limit reached. Cannot add more details." });
      }
  
      const isValidDate = await isDateWithinPeriod(instructorId, workDetails.date);
      if (!isValidDate) {
        return res.status(400).json({ 
          message: "The work date must be within the instructor's period beginning and ending dates." 
        });
      }
  
      const existingWorkDetail = await WorkDetails.findOne({ 
        instructor: instructorId, 
        "workDetails.date": workDetails.date 
      });
  
      if (existingWorkDetail) {
        return res.status(400).json({ message: "Work details for this date already exist." });
      }

      const newWorkDetails = new WorkDetails({
        workDetails,
        instructor: instructorId,
      });
  
      await newWorkDetails.save();
      return res.status(201).json(newWorkDetails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating work details' });
    }
  };
  
export const createWeek1WorkDetails = async (req: Request, res: Response) => {
    try {
      const { instructorId, workDetails } = req.body;
  
      // Ensure that the instructor has a period beginning and ending date set
      const instructor = await InstructorDetails.findById(instructorId);
      if (!instructor) {
        return res.status(400).json({ message: "Instructor not found." });
      }

      const periodBeginning = new Date(instructor.periodBeginning);
      const periodEnding = new Date(instructor.periodEnding);

      // Calculate the start and end of Week 1 (first 7 days from periodBeginning)
      const week1Start = periodBeginning;
      const week1End = new Date(periodBeginning);
      week1End.setDate(week1Start.getDate() + 7); // Add 7 days to periodBeginning for Week 1 end date

      // Check if the work date falls within Week 1
      const workDate = new Date(workDetails.date);
      if (workDate < week1Start || workDate > week1End) {
        return res.status(400).json({ message: "The work date must be within the Week 1 period." });
      }
  
      // Check if a work detail already exists for this date in Week 1
      const existingWorkDetail = await WorkDetails.findOne({ 
        instructor: instructorId, 
        "workDetails.date": workDetails.date 
      });
  
      if (existingWorkDetail) {
        return res.status(400).json({ message: "Work details for this date already exist in Week 1." });
      }

      const newWorkDetails = new WorkDetails({
        workDetails,
        instructor: instructorId,
      });
  
      await newWorkDetails.save();
      return res.status(201).json(newWorkDetails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating Week 1 work details' });
    }
};

export const createWeek2WorkDetails = async (req: Request, res: Response) => {
  try {
    const { instructorId, workDetails } = req.body;

    const instructor = await InstructorDetails.findById(instructorId);
    if (!instructor) {
      return res.status(400).json({ message: "Instructor not found." });
    }

    const periodBeginning = new Date(instructor.periodBeginning);
    const periodEnding = new Date(instructor.periodEnding);

    const week2Start = new Date(periodBeginning);
    week2Start.setDate(periodBeginning.getDate() + 7); 

    const week2End = periodEnding;  

    const workDate = new Date(workDetails.date);
    if (workDate < week2Start || workDate > week2End) {
      return res.status(400).json({ message: "The work date must be within the Week 2 period." });
    }

    const existingWorkDetail = await WorkDetails.findOne({ 
      instructor: instructorId, 
      "workDetails.date": workDetails.date 
    });

    if (existingWorkDetail) {
      return res.status(400).json({ message: "Work details for this date already exist in Week 2." });
    }

    const newWorkDetails = new WorkDetails({
      workDetails,
      instructor: instructorId,
    });

    await newWorkDetails.save();
    return res.status(201).json(newWorkDetails);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating Week 2 work details' });
  }
};

export const getWorkDetails = async (req: Request, res: Response) => {
    try {
      const { workDetailsId } = req.params;
  
      const workDetails = await WorkDetails.find({ workDetailsId: workDetailsId })
        .populate('instructor')
        .populate('instructor.instructorName')
        .exec();
  
      return res.status(200).json(workDetails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching work details' });
    }
  };

export const createMilesDetails = async (req: Request, res: Response) => {
    try {
      const { instructorId, milesDetails } = req.body;
   
      const instructor = await InstructorDetails.findById(instructorId);
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
  
      const existingMilesCount = await MilesDetails.countDocuments({ instructor: instructorId });
      
      let weekNumber;
      if (existingMilesCount === 0) {
        weekNumber = 1;
      } else if (existingMilesCount === 1) {

        weekNumber = 2;
      } else {

        return res.status(400).json({ 
          message: "Miles limit reached. Only two entries allowed per instructor (one per week)." 
        });
      }
  
      const newMilesDetails = new MilesDetails({
        milesDetails,
        instructor: instructorId,
        weekNumber: weekNumber, 
      });
   
      await newMilesDetails.save();
      return res.status(201).json(newMilesDetails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating miles details' });
    }
  };
export const getMilesDetails = async (req: Request, res: Response) => {
    try {   
      const { milesDetailsId } = req.params;
  
      const milesDetails = await MilesDetails.find({ milesDetailsId: milesDetailsId })
        .populate('instructor')
        .populate('instructor.instructorName')
        .exec();
  
      return res.status(200).json(milesDetails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching miles details' });
    }
  };
  

export const getAllDataByInstructorId = async (req: Request, res: Response) => {
    try {
      const { instructorId } = req.params;
  
      const instructor = await InstructorDetails.findById(instructorId);
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
  
      await instructor.populate('instructorName');
  
      const workDetails = await WorkDetails.find({ instructor: instructorId });
      const milesDetails = await MilesDetails.find({ instructor: instructorId });
  
      const processedWorkDetails = workDetails.map((workDetail) => {
        const { hours, hourRate } = workDetail.workDetails;
        const totalAmount = hours * hourRate;
        return {
          ...workDetail.toObject(),
          totalAmount,
          date: new Date(workDetail.workDetails.date),
        };
      });
  
      const processedMilesDetails = milesDetails.map((mileDetail) => {
        const { miles, mileRate } = mileDetail.milesDetails;
        const totalAmount = miles * mileRate;
        return {
          ...mileDetail.toObject(),
          totalAmount,
          date: new Date(mileDetail.milesDetails.date),
        };
      });
  
      const periodBeginning = new Date(instructor.periodBeginning);
      const periodEnding = new Date(instructor.periodEnding);
  
      const weeklyData = [];
      
      // First week
      const week1Start = new Date(periodBeginning);
      const week1End = new Date(periodBeginning);
      week1End.setDate(week1End.getDate() + 6); // 7 days total for first week
      
      // Second week
      const week2Start = new Date(week1End);
      week2Start.setDate(week2Start.getDate() + 1); // Start day after first week ends
      const week2End = new Date(periodEnding);
      
      // Filter work details by date range
      const week1WorkDetails = processedWorkDetails.filter(
        detail => detail.date >= week1Start && detail.date <= week1End
      );
      
      const week2WorkDetails = processedWorkDetails.filter(
        detail => detail.date >= week2Start && detail.date <= week2End
      );
      
      // Filter miles details by weekNumber instead of date
      const week1MilesDetails = processedMilesDetails.filter(
        detail => detail.weekNumber === 1
      );
      
      const week2MilesDetails = processedMilesDetails.filter(
        detail => detail.weekNumber === 2
      );
      
      // Rest of your calculations remain the same
      const week1WorkingHours = week1WorkDetails.reduce(
        (total, detail) => total + detail.workDetails.hours, 0
      );
      
      const week1Miles = week1MilesDetails.reduce(
        (total, detail) => total + detail.milesDetails.miles, 0
      );
      

      
      // Calculate average rates for Week 1
      const week1AvgHourRate = week1WorkingHours > 0 
        ? week1WorkDetails.reduce((total, detail) => total + detail.workDetails.hourRate * detail.workDetails.hours, 0) / week1WorkingHours 
        : 0;
      
      const week1AvgMileageRate = week1Miles > 0 
        ? week1MilesDetails.reduce((total, detail) => total + detail.milesDetails.mileRate * detail.milesDetails.miles, 0) / week1Miles 
        : 0;
      
      const week1WorkAmount = week1WorkDetails.reduce(
        (total, detail) => total + detail.totalAmount, 0
      );
      
      const week1MilesAmount = week1MilesDetails.reduce(
        (total, detail) => total + detail.totalAmount, 0
      );
      
      // Week 2 calculations
      const week2WorkingHours = week2WorkDetails.reduce(
        (total, detail) => total + detail.workDetails.hours, 0
      );
      
      const week2Miles = week2MilesDetails.reduce(
        (total, detail) => total + detail.milesDetails.miles, 0
      );
      
      const week2WorkAmount = week2WorkDetails.reduce(
        (total, detail) => total + detail.totalAmount, 0
      );
      
      const week2MilesAmount = week2MilesDetails.reduce(
        (total, detail) => total + detail.totalAmount, 0
      );
      
      // Calculate average rates for Week 2
      const week2AvgHourRate = week2WorkingHours > 0 
        ? week2WorkDetails.reduce((total, detail) => total + detail.workDetails.hourRate * detail.workDetails.hours, 0) / week2WorkingHours 
        : 0;
      
      const week2AvgMileageRate = week2Miles > 0 
        ? week2MilesDetails.reduce((total, detail) => total + detail.milesDetails.mileRate * detail.milesDetails.miles, 0) / week2Miles 
        : 0;
      
      // Add Week 1 data
      weeklyData.push({
        weekNumber: 1,
        weekStart: week1Start,
        weekEnd: week1End,
        workDetails: week1WorkDetails,
        milesDetails: week1MilesDetails, 
        summary: {
          totalWorkingHours: week1WorkingHours,
          totalMiles: week1Miles,
          avgHourRate: parseFloat(week1AvgHourRate.toFixed(2)),
          avgMileageRate: parseFloat(week1AvgMileageRate.toFixed(2)),
          totalWorkAmount: parseFloat(week1WorkAmount.toFixed(2)),
          totalMilesAmount: parseFloat(week1MilesAmount.toFixed(2)),
          weekTotalAmount: parseFloat((week1WorkAmount + week1MilesAmount).toFixed(2))
        }
      });
      
      // Add Week 2 data
      weeklyData.push({
        weekNumber: 2,
        weekStart: week2Start,
        weekEnd: week2End,
        workDetails: week2WorkDetails,
        milesDetails: week2MilesDetails,  
        summary: {
          totalWorkingHours: week2WorkingHours,
          totalMiles: week2Miles,
          avgHourRate: parseFloat(week2AvgHourRate.toFixed(2)),
          avgMileageRate: parseFloat(week2AvgMileageRate.toFixed(2)),
          totalWorkAmount: parseFloat(week2WorkAmount.toFixed(2)),
          totalMilesAmount: parseFloat(week2MilesAmount.toFixed(2)),
          weekTotalAmount: parseFloat((week2WorkAmount + week2MilesAmount).toFixed(2))
        }
      });
  
const overallTotals = {
    totalWorkingHours: week1WorkingHours + week2WorkingHours,
    totalWorkAmount: parseFloat((week1WorkAmount + week2WorkAmount).toFixed(2)),
    grandTotalAmount: parseFloat((week1WorkAmount + week2WorkAmount).toFixed(2)),
    totalMiles: week1Miles + week2Miles,
    totalMilesAmount: parseFloat((week1MilesAmount + week2MilesAmount).toFixed(2)),
  };

  // Biweekly Section: Combine work details for both weeks (without miles)
  const biweeklyWorkDetails = [...week1WorkDetails, ...week2WorkDetails];

  // Calculate total working hours and total amount for biweekly period
  const totalBiweeklyWorkingHours = biweeklyWorkDetails.reduce(
    (total, detail) => total + detail.workDetails.hours, 0
  );

  const totalBiweeklyWorkAmount = biweeklyWorkDetails.reduce(
    (total, detail) => total + detail.totalAmount, 0
  );

  // Calculate average hour rate for biweekly period
  const biweeklyAvgHourRate = totalBiweeklyWorkingHours > 0
    ? biweeklyWorkDetails.reduce(
        (total, detail) => total + detail.workDetails.hourRate * detail.workDetails.hours, 0
      ) / totalBiweeklyWorkingHours
    : 0;


  const biweeklyData = {
    workDetails: biweeklyWorkDetails,
    summary: {
      totalWorkingHours: totalBiweeklyWorkingHours,
      avgHourRate: parseFloat(biweeklyAvgHourRate.toFixed(2)),
      totalWorkAmount: parseFloat(totalBiweeklyWorkAmount.toFixed(2)),

    },
  };

  return res.status(200).json({
    instructor,
    weeklyData,
    biweeklyData, 
    overallTotals,
    
  });


    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching data' });
    }
  };

  
  

  
  
