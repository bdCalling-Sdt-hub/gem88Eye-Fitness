import { Router } from "express";
import { createStaff, deleteStaff, editStaff, getAllStaff } from "./staff.controller";
import { authenticateAdmin } from "../../middlewares/auth";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const StaffRoutes = Router();

StaffRoutes.post("/create",authenticateAdmin, createStaff);
StaffRoutes.put("/update/:staffId", authenticateAdmin ,editStaff);
StaffRoutes.delete("/delete/:staffId", authenticateAdmin, deleteStaff);
StaffRoutes.get("/all", authenticateAdmin, getAllStaff);

export default StaffRoutes;
