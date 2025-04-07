import { Router } from "express";
import { registerAdmin, loginAdmin, changePassword, createLocation, getAllLocations, forgetPassword, verifyOTP, resetPassword } from "./controller";
import { authenticateAdmin } from "../../middlewares/auth";


const AdminRoutes = Router();

AdminRoutes.post("/register", registerAdmin);
AdminRoutes.post("/login", loginAdmin);
AdminRoutes.post("/change-password",authenticateAdmin, changePassword);
AdminRoutes.post("/location",authenticateAdmin,createLocation );
AdminRoutes.get("/location",authenticateAdmin,getAllLocations );

//password-forget
AdminRoutes.post("/forget-password", authenticateAdmin,forgetPassword);
AdminRoutes.post("/verify-otp",authenticateAdmin, verifyOTP);
AdminRoutes.post("/reset-password", authenticateAdmin,resetPassword);

export default AdminRoutes;
