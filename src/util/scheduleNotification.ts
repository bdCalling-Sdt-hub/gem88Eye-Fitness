import schedule from 'node-schedule';
import Notification from '../app/modules/notification/notification.model';
import Admin from '../app/modules/Admin/admin.model';
import Staff from '../app/modules/staff/staff.model';
import Lead from '../app/modules/contact/leads.model';

export const scheduleNotification = async (
  userId: string, 
  message: string, 
  scheduledTime: Date, 
  type: 'Appointment' | 'Class', 
  io: any,
  sendImmediately: boolean = false
) => {
  try {
    console.log("Scheduling notification for userId:", userId);

    let user;
    
    user = await Admin.findById(userId);
    if (user) {
      console.log("Found Admin:", user);
    } else {
      user = await Staff.findById(userId);
      if (user) {
        console.log("Found Staff:", user);
      } else {

        user = await Lead.findById(userId);
        if (user) {
          console.log("Found Lead:", user);
        }
      }
    }

    if (!user) {
      console.error(`Invalid userId: ${userId} does not exist in any model.`);
      throw new Error(`Invalid userId: User does not exist in any model for ${userId}`);
    }

    // Create the notification in the database
    const notification = await Notification.create({
      userId,
      userModel: user instanceof Admin ? 'Admin' : user instanceof Staff ? 'Staff' : 'Lead',
      message,
      scheduledTime,
      type,
      isRead: false,
      isSent: false,
    });

    // If sendImmediately is true, emit the notification right away
    if (sendImmediately && io) {
      io.to(userId).emit('notification', notification);
    }

    // Schedule the notification for the future if not immediate
    if (!sendImmediately) {
      const job = schedule.scheduleJob(scheduledTime, async () => {
        // Emit the notification at the scheduled time
        if (io) {
          io.to(userId).emit('notification', notification);
        }

        // Update the notification as sent
        await Notification.findByIdAndUpdate(notification._id, { 
          isSent: true 
        });
      });
    }

    return notification;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};




export const createAdminNotifications = async (
  eventName: string,
  eventType: 'Appointment' | 'Class',
  eventDate: Date,
  io: any
) => {
  try {
    // Find all admins
    const admins: { _id: string }[] = await Admin.find();
    
    // Create immediate notification
    const immediateNotifications = admins.map(admin => {
      const immediateMessage = `New ${eventType.toLowerCase()} created: ${eventName}`;
      return scheduleNotification(
        admin._id,
        immediateMessage,
        new Date(), // immediate notification
        eventType,
        io,
        true // send immediately
      );
    });
    
    // Create reminder notification (1 day before the event)
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    
    // Only schedule reminder if it's in the future
    if (reminderDate > new Date()) {
      const reminderNotifications = admins.map(admin => {
        const reminderMessage = `Reminder: ${eventType} "${eventName}" is scheduled for tomorrow`;
        return scheduleNotification(
          admin._id.toString(),
          reminderMessage,
          reminderDate,
          eventType,
          io,
          false // schedule for future
        );
      });
      
      await Promise.all([...immediateNotifications, ...reminderNotifications]);
    } else {
      await Promise.all(immediateNotifications);
    }
  } catch (error) {
    console.error('Error creating admin notifications:', error);
    throw error;
  }
};