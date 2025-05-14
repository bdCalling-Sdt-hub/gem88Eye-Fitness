"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middlewares/auth");
const RolesRouter = (0, express_1.Router)();
RolesRouter.post("/assign-role", auth_1.authenticateAdmin, controller_1.assignRole);
RolesRouter.get("/getall-rooles", auth_1.authenticateAdmin, controller_1.getRoles);
exports.default = RolesRouter;
