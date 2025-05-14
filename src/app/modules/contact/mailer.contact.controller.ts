import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import moment from 'moment';
import Client from './client.model';
import Lead from './leads.model';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'azizulhoq4305@gmail.com',
    pass: 'igidksaeqbnfqkeh'
  }
});

export const sendEmailToLeadOrClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { timeInterval, subject, message, leadId } = req.body;

  if (!subject || !message) {
     res.status(400).json({
      success: false,
      message: 'Subject and Message are required.',
    });
    return;
  }

  try {
    if (leadId) {
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
        from: 'azizulhoq4305@gmail.com',
        to: leadEmail,  
        subject: subject,
        text: message,
      };

      await transporter.sendMail(mailOptions);

       res.status(200).json({
        success: true,
        message: `Email sent successfully to lead: ${lead.client_email}`,
      });
      return;
    } else {
      let dateFilter;

      if (timeInterval === '1 week') {
        dateFilter = moment().subtract(1, 'weeks').toDate();
      } else if (timeInterval === '1 month') {
        dateFilter = moment().subtract(1, 'months').toDate();
      } else if (timeInterval === '1 year') {
        dateFilter = moment().subtract(1, 'years').toDate();
      } else if (timeInterval === 'all') {
        dateFilter = null;  
      } else {
         res.status(400).json({ success: false, message: 'Invalid time interval.' });
         return;
      }

      let clients;
      if (dateFilter) {
        clients = await Client.find({ createdAt: { $gte: dateFilter } }); 
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
          console.error(`Client ${client.name} does not have an email address.`); 
          return;
        }

        const mailOptions = {
          from: 'azizulhoq4305@gmail.com',  
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
    next(err); 
  }
};