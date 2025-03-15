import { Router } from "express";

import { assignRole, getRoles } from "./controller";
import { authenticateAdmin } from "../../middlewares/auth";

const RolesRouter = Router();

RolesRouter.post("/assign-role", authenticateAdmin, assignRole);
RolesRouter.get("/getall-rooles", authenticateAdmin, getRoles);

export default RolesRouter;
