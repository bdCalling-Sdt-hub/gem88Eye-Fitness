"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("./staff.controller");
const auth_1 = require("../../middlewares/auth");
const setStuffRoutes = (0, express_1.Router)();
setStuffRoutes.post("/set-password", staff_controller_1.setPassword);
setStuffRoutes.post("/login", staff_controller_1.staffLogin);
setStuffRoutes.post("/forget-password", staff_controller_1.forgetPassword);
setStuffRoutes.post("/verify-otp", staff_controller_1.verifyOTP);
setStuffRoutes.post("/reset-password", staff_controller_1.resetPassword);
setStuffRoutes.post("/add-aviliability", staff_controller_1.addStaffAvailability);
setStuffRoutes.put('/stuff-profile', auth_1.authenticateUser, staff_controller_1.updateProfile);
setStuffRoutes.get("/stuff-profile", auth_1.authenticateUser, staff_controller_1.getUserProfile);
setStuffRoutes.get("/stuff-aviliability", staff_controller_1.getAllStaffAvailabilityByDay);
exports.default = setStuffRoutes;
