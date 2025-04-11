
import { Router } from "express";
import { createPaymentReport } from "./paymentReport.controller";
import { createMilesReport, getAllReports } from "./miles.controller";
import { authenticateAdmin } from "../../middlewares/auth";
import { exportCSV, exportReportsAsCSV, getAllReportsOV, getOverviewReport,} from "./overview.controller";

const ReportRoutes = Router();

ReportRoutes.post("/miles", authenticateAdmin,createMilesReport);
ReportRoutes.post("/payment",authenticateAdmin ,createPaymentReport);
ReportRoutes.get("/getall", authenticateAdmin,getAllReports);
// ReportRoutes.get("/getDataFilter", authenticateAdmin, getDateFilter);
ReportRoutes.get("/getOverviewReport", authenticateAdmin, getOverviewReport);
ReportRoutes.get("/reports/export", authenticateAdmin,exportCSV );
ReportRoutes.get("/overview", getAllReportsOV);
ReportRoutes.get("/report-home", exportReportsAsCSV);


export default ReportRoutes;
