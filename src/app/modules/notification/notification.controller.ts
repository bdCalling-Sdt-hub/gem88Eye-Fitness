import { Request, Response } from 'express';
import {Notification} from './notification.model'; // Adjust the path as needed

interface CustomRequest extends Request {
  params: {
    userId: string;
  };
}

export const getNotifications = async (req: CustomRequest, res: Response) => {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ scheduledTime: -1 });
    res.status(200).json({ success: true, data: notifications });
};