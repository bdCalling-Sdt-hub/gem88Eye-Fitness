
import { Router } from "express";
import { createPaymentReport } from "./paymentReport.controller";
// import { createMilesReport, getAllReports } from "./miles.controller";
import { authenticateAdmin } from "../../middlewares/auth";
// import { exportCSV, exportReportsAsCSV, getAllReportsOV, getOverviewReport,} from "./overview.controller";
// import { createWorkDetail, deleteWorkDetail, updateWorkDetail } from "./workdetails.controller";
import { createInstructor, createMilesDetails, createWorkDetails, getAllDataByInstructorId, getInstructorById, getInstructors, getMilesDetails, getWorkDetails } from "./work.model/work.controller";

const ReportRoutes = Router();

// ReportRoutes.post("/miles", authenticateAdmin,createMilesReport);
ReportRoutes.post("/payment",authenticateAdmin ,createPaymentReport);
ReportRoutes.post("/instructor",authenticateAdmin ,createInstructor);
ReportRoutes.post("/workdetails",authenticateAdmin ,createWorkDetails);
ReportRoutes.get("/workdetail",authenticateAdmin ,getWorkDetails);
ReportRoutes.post("/milesdetails",authenticateAdmin ,createMilesDetails);
ReportRoutes.get("/milesdetails/",authenticateAdmin ,getMilesDetails);
ReportRoutes.get("/instructor",authenticateAdmin ,getInstructors);
ReportRoutes.get("/instructor/:id",authenticateAdmin ,getInstructorById);
ReportRoutes.get("/inalldetails/:instructorId",authenticateAdmin ,getAllDataByInstructorId);

// ReportRoutes.put("/workdetails/:id",authenticateAdmin ,updateWorkDetail);
// ReportRoutes.delete("/workdetails/:id",authenticateAdmin ,deleteWorkDetail);
// ReportRoutes.get("/getall", authenticateAdmin,getAllReports);
// // ReportRoutes.get("/getDataFilter", authenticateAdmin, getDateFilter);
// ReportRoutes.get("/getOverviewReport", authenticateAdmin, getOverviewReport);
// ReportRoutes.get("/reports/export", authenticateAdmin,exportCSV );
// ReportRoutes.get("/overview", getAllReportsOV);
// ReportRoutes.get("/report-home", exportReportsAsCSV);


export default ReportRoutes;
