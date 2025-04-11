
import schedule from 'node-schedule';
import { Notification } from '../app/modules/notification/notification.model';

export const scheduleNotification = (userId: string, message: string, times: Date[], type: 'Appointment' | 'Class', io: any) => {
  times.forEach((time) => {
    const job = schedule.scheduleJob(time, async () => {
      const notification = await Notification.create({ userId, message, scheduledTime: time, type });
      io.to(userId).emit('notification', notification);
    });
  });
};
