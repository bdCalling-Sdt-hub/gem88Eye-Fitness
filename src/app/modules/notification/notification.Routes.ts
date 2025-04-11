import { Router } from "express";
import { getNotifications } from "./notification.controller";

const NotificationRoutes = Router();

NotificationRoutes.get('/:userId', getNotifications);

export default NotificationRoutes;
