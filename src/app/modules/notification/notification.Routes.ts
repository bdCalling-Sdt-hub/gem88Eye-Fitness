import express from 'express';
import { authenticateAdmin } from '../../middlewares/auth';
import { getNotifications } from './notification.controller';


const notification = express.Router();

notification.get('/admin', authenticateAdmin, getNotifications);

export default notification;