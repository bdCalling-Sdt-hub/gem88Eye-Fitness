import { Router } from "express";
import { registerAdmin, loginAdmin, changePassword, createLocation, getAllLocations } from "./controller";
import { authenticateAdmin } from "../../middlewares/auth";


const AdminRoutes = Router();

AdminRoutes.post("/register", registerAdmin);
AdminRoutes.post("/login", loginAdmin);
AdminRoutes.post("/change-password",authenticateAdmin, changePassword);
AdminRoutes.post("/location",authenticateAdmin,createLocation );
AdminRoutes.get("/location",authenticateAdmin,getAllLocations );


export default AdminRoutes;
