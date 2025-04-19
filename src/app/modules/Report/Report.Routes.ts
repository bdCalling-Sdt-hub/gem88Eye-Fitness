
import { Router } from "express";
import { createPaymentReport } from "./paymentReport.controller";
import { authenticateAdmin } from "../../middlewares/auth";
import { createInstructor, createMilesDetails, createWorkDetails, getAllDataByInstructorId, getInstructorById, getInstructors, getMilesDetails, getWorkDetails } from "./work.model/work.controller";

const ReportRoutes = Router();

ReportRoutes.post("/payment",authenticateAdmin ,createPaymentReport);
ReportRoutes.post("/instructor",authenticateAdmin ,createInstructor);
ReportRoutes.post("/workdetails",authenticateAdmin ,createWorkDetails);
ReportRoutes.get("/workdetail",authenticateAdmin ,getWorkDetails);
ReportRoutes.post("/milesdetails",authenticateAdmin ,createMilesDetails);
ReportRoutes.get("/milesdetails/",authenticateAdmin ,getMilesDetails);
ReportRoutes.get("/instructor",authenticateAdmin ,getInstructors);
ReportRoutes.get("/instructor/:id",authenticateAdmin ,getInstructorById);
ReportRoutes.get("/inalldetails/:instructorId",authenticateAdmin ,getAllDataByInstructorId);



export default ReportRoutes;
