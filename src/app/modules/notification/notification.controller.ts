// import { Request, Response } from 'express';
// import {Notification} from './notification.model'; // Adjust the path as needed

// interface CustomRequest extends Request {
//   params: {
//     userId: string;
//   };
// }

// export const getNotifications = async (req: CustomRequest, res: Response) => {
//     const { userId } = req.params;
//     const notifications = await Notification.find({ userId }).sort({ scheduledTime: -1 });
//     res.status(200).json({ success: true, data: notifications });
// };




// Import required modules
import { Request, Response, NextFunction } from 'express';
import  Notification  from './notification.model';
import mongoose from 'mongoose';
import  admin  from '../Admin/admin.model';

// Updated version of your getNotifications controller
export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = (req as any).admin;

    if (!admin || !admin.id) {
       res.status(403).json({ success: false, message: 'Access denied' });
       return;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const typeFilter = req.query.type ? { type: req.query.type } : {};
    const dateFilter = req.query.dateFrom && req.query.dateTo ? {
      scheduledTime: {
        $gte: new Date(req.query.dateFrom as string),
        $lte: new Date(req.query.dateTo as string)
      }
    } : {};
    
    // Status filter
    const statusFilter = req.query.status === 'read' ? { isRead: true } : 
                         req.query.status === 'unread' ? { isRead: false } : {};

    // Combine all filters
    const filters = {
      userId: admin.id,
      ...typeFilter,
      ...dateFilter,
      ...statusFilter
    };

    // Fetch notifications with filters and pagination
    const notifications = await Notification.find(filters)
      .sort({ scheduledTime: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total filtered notifications count
    const totalNotifications = await Notification.countDocuments(filters);

    // Return notifications with pagination details
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully.',
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const admin = (req as any).admin;

    if (!admin || !admin.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const notification = await Notification.findOne({ 
      _id: notificationId,
      userId: admin.id
    });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (err) {
    next(err);
  }
};
