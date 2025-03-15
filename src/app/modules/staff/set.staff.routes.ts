import { Router } from "express";
import {forgetPassword, resetPassword, setPassword, staffLogin, verifyOTP } from "./staff.controller";
// import { authenticateAdmin } from "../../middlewares/auth";

const setStuffRoutes = Router();

setStuffRoutes.post("/set-password", setPassword);
setStuffRoutes.post("/login", staffLogin);
setStuffRoutes.post("/forget-password", forgetPassword);
setStuffRoutes.post("/verify-otp", verifyOTP);
setStuffRoutes.post("/reset-password",resetPassword );


export default setStuffRoutes;
