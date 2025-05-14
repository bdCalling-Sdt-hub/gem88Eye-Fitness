import { Request, Response } from "express";
import PaymentReport from "./paymentReport.model";
import Staff from "../staff/staff.model";
import {Location} from "../Admin/location.model"; 

const getReportPeriod = () => {
  const today = new Date();
  const periodBeginning = new Date(today);
  const periodEnding = new Date(today);
  periodEnding.setDate(periodEnding.getDate() + 14); // Two weeks later
  return { periodBeginning, periodEnding };
};

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

