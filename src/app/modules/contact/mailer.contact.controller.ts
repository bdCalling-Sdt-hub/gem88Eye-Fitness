// src/app/controllers/contact.controller.ts
import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import moment from 'moment';
import Client from './client.model'; // Ensure the path is correct
import Lead from './leads.model';

// // Configure Nodemailer transport (SMTP configuration)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use your SMTP service
  auth: {
    user: 'azizulhoq4305@gmail.com',
    pass: 'igidksaeqbnfqkeh'
  }
});

// // Controller to send email to clients based on time interval
// export const sendEmailToClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { timeInterval, subject, message } = req.body;  // Get time interval, subject, and message from the request

//   if (!timeInterval || !subject || !message) {
//      res.status(400).json({
//       success: false,
//       message: 'Time Interval, Subject, and Message are required.'
//     });
//   }

//   try {
//     // Calculate the date range based on the time interval
//     let dateFilter;
//     if (timeInterval === '1 week') {
//       dateFilter = moment().subtract(1, 'weeks').toDate();
//     } else if (timeInterval === '1 month') {
//       dateFilter = moment().subtract(1, 'months').toDate();
//     } else if (timeInterval === '1 year') {
//       dateFilter = moment().subtract(1, 'years').toDate();
//     } else if (timeInterval === 'all') {
//       dateFilter = null;  // No filter for "all"
//     } else {
//        res.status(400).json({ success: false, message: 'Invalid time interval.' });
//        return
//     }

//     // Find clients based on the time interval
//     let clients;
//     if (dateFilter) {
//       clients = await Client.find({ createdAt: { $gte: dateFilter } });  // Find clients created after the calculated date
//     } else {
//       clients = await Client.find();  // All clients
//     }

//     if (clients.length === 0) {
//        res.status(404).json({ success: false, message: 'No clients found for the selected time interval.' });
//        return
//     }

//     // Send email to each client
//     for (const client of clients) {
//       const mailOptions = {
//         from: 'your-email@gmail.com',
//         to: client.client_email,
//         subject: subject,
//         text: message
//       };

//       // Send email using Nodemailer
//       await transporter.sendMail(mailOptions);
//     }

//     res.status(200).json({
//       success: true,
//       message: `Emails sent to ${clients.length} clients successfully!`
//     });

//   } catch (err) {
//     next(err); // Pass the error to the global error handler
//   }
// };

export const sendEmailToLeadOrClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { timeInterval, subject, message, leadId } = req.body;

  // Validation for subject and message
  if (!subject || !message) {
     res.status(400).json({
      success: false,
      message: 'Subject and Message are required.',
    });
    return;
  }

  try {
    if (leadId) {
      // If a leadId is provided, send email to that specific lead
      const lead = await Lead.findById(leadId);
      if (!lead) {
         res.status(404).json({
          success: false,
          message: 'Lead not found.',
        });
        return;
      }

      const leadEmail = lead.lead_email;
      if (!leadEmail) {
         res.status(400).json({
          success: false,
          message: 'Lead does not have an email address.',
        });
        return;
      }

      const mailOptions = {
        from: 'azizulhoq4305@gmail.com',  // Use your email or environment config for "from" email
        to: leadEmail,  // Send email to the lead's email
        subject: subject,
        text: message,
      };

      // Send email using Nodemailer
      await transporter.sendMail(mailOptions);

       res.status(200).json({
        success: true,
        message: `Email sent successfully to lead: ${lead.client_email}`,
      });
      return;
    } else {
      // If no leadId is provided, find clients based on the time interval
      let dateFilter;

      // Determine the date filter based on the timeInterval provided
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
         return;
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
         return;
      }

      // Send email to each client asynchronously using Promise.all for efficiency
      const emailPromises = clients.map(async (client) => {
        const clientEmail = client.client_email;
        if (!clientEmail) {
          console.error(`Client ${client.client_name} does not have an email address.`);  // Skip clients without email
          return;
        }

        const mailOptions = {
          from: 'azizulhoq4305@gmail.com',  // Use your email or environment config for "from" email
          to: clientEmail,
          subject: subject,
          text: message,
        };

        // Send email using Nodemailer
        await transporter.sendMail(mailOptions);
      });

      // Wait for all email promises to resolve
      await Promise.all(emailPromises);

       res.status(200).json({
        success: true,
        message: `Emails sent to ${clients.length} clients successfully!`,
      });
      return;
    }
  } catch (err) {
    next(err);  // Pass the error to the global error handler
  }
};