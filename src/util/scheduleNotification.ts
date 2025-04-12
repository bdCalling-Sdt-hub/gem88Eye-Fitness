import schedule from 'node-schedule';
import { Notification } from '../app/modules/notification/notification.model';
import Admin  from '../app/modules/Admin/admin.model';
import  Staff  from '../app/modules/staff/staff.model';
import Lead from '../app/modules/contact/leads.model';


export const scheduleNotification = (userId: string, message: string, times: Date[], type: 'Appointment' | 'Class', io: any, userType: 'Admin' | 'Staff') => {
  times.forEach((time) => {
    const job = schedule.scheduleJob(time, async () => {
      let user;

      // Fetch the user (admin or staff) based on the userType
      if (userType === 'Admin') {
        user = await Admin.findById(userId); 
      } else if (userType === 'Staff') {
        user = await Staff.findById(userId); 
      } else if (userType === 'Lead') {
        user = await Lead.findById(userId); 
      }


      if (user) {
        const notification = await Notification.create({
          userId, 
          message, 
          scheduledTime: time, 
          type
        });

        // Emit the notification to the user based on the userType
        io.to(userId).emit('notification', notification);
      } else {
        console.error(`User with ID ${userId} not found.`);
      }
    });
  });
};
