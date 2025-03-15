
import { Router } from "express";
import { createPaymentReport } from "./paymentReport.controller";
import { createMilesReport, getAllReports } from "./miles.controller";
import { authenticateAdmin } from "../../middlewares/auth";
import { exportCSV, getOverviewReport,} from "./overview.controller";

const ReportRoutes = Router();

ReportRoutes.post("/miles", authenticateAdmin,createMilesReport);
ReportRoutes.post("/payment",authenticateAdmin ,createPaymentReport);
ReportRoutes.get("/getall", authenticateAdmin,getAllReports);
// ReportRoutes.get("/getDataFilter", authenticateAdmin, getDateFilter);
ReportRoutes.get("/getOverviewReport", authenticateAdmin, getOverviewReport);
ReportRoutes.get("/reports/export", authenticateAdmin,exportCSV );


export default ReportRoutes;
