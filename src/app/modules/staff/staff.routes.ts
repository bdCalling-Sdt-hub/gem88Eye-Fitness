import { Router } from "express";
import { createStaff, getAllStaff } from "./staff.controller";
import { authenticateAdmin } from "../../middlewares/auth";

const StaffRoutes = Router();

StaffRoutes.post("/create",authenticateAdmin, createStaff);
StaffRoutes.get("/all", authenticateAdmin, getAllStaff);



export default StaffRoutes;
