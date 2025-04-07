import { Router } from "express";
import {forgetPassword,  getUserProfile,  resetPassword, setPassword, staffLogin, updateProfile, verifyOTP } from "./staff.controller";
import auth, { authenticateStaff, authenticateUser } from "../../middlewares/auth";
// import { authenticateAdmin } from "../../middlewares/auth";

const setStuffRoutes = Router();

setStuffRoutes.post("/set-password", setPassword);
setStuffRoutes.post("/login", staffLogin);
setStuffRoutes.post("/forget-password", forgetPassword);
setStuffRoutes.post("/verify-otp", verifyOTP);
setStuffRoutes.post("/reset-password",resetPassword );
setStuffRoutes.put('/stuff-profile', authenticateUser, updateProfile);
setStuffRoutes.get("/stuff-profile",authenticateUser, getUserProfile);


export default setStuffRoutes;
