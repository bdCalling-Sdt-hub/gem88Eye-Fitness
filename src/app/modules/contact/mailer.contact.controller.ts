// src/app/controllers/contact.controller.ts
import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import moment from 'moment';
import Client from './client.model'; // Ensure the path is correct

// Configure Nodemailer transport (SMTP configuration)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use your SMTP service
  auth: {
    user: 'azizulhoq4305@gmail.com',
    pass: 'igidksaeqbnfqkeh'
  }
});

// Controller to send email to clients based on time interval
export const sendEmailToClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { timeInterval, subject, message } = req.body;  // Get time interval, subject, and message from the request

  if (!timeInterval || !subject || !message) {
     res.status(400).json({
      success: false,
      message: 'Time Interval, Subject, and Message are required.'
    });
  }

  try {
    // Calculate the date range based on the time interval
    let dateFilter;
    if (timeInterval === '1 week') {
      dateFilter = moment().subtract(1, 'weeks').toDate();
    } else if (timeInterval === '1 month') {
      dateFilter = moment().subtract(1, 'months').toDate();
    } else if (timeInterval === '1 year') {
      dateFilter = moment().subtract(1, 'years').toDate();
    } else if (timeInterval === 'all') {
      dateFilter = null;  // No filter for "all"
    } else {
       res.status(400).json({ success: false, message: 'Invalid time interval.' });
       return
    }

    // Find clients based on the time interval
    let clients;
    if (dateFilter) {
      clients = await Client.find({ createdAt: { $gte: dateFilter } });  // Find clients created after the calculated date
    } else {
      clients = await Client.find();  // All clients
    }

    if (clients.length === 0) {
       res.status(404).json({ success: false, message: 'No clients found for the selected time interval.' });
       return
    }

    // Send email to each client
    for (const client of clients) {
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: client.client_email,
        subject: subject,
        text: message
      };

      // Send email using Nodemailer
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({
      success: true,
      message: `Emails sent to ${clients.length} clients successfully!`
    });

  } catch (err) {
    next(err); // Pass the error to the global error handler
  }
};
