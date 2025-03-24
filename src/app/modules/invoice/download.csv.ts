// src/app/controllers/invoice.controller.ts
import { Request, Response, NextFunction } from 'express';
import Invoice from './invoice.model';
import { Parser } from 'json2csv';  // Import json2csv library to convert JSON to CSV
import path from 'path';
import fs from 'fs';  // File system to save the CSV file


export const downloadAllInvoicesCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch all invoices from the database
      const invoices = await Invoice.find();
  
      // If no invoices are found
      if (invoices.length === 0) {
         res.status(404).json({
          success: false,
          message: 'No invoices found to download.',
        });
      }
  
      // Define the fields you want to include in the CSV
      const fields = ['invoiceId', 'client', 'className', 'contactName', 'services', 'invoiceTotal', 'invoiceNumber', 'invoiceDate', 'invoiceDueDate', 'active'];
      const opts = { fields };
  
      // Convert invoices data to CSV
      const parser = new Parser(opts);
      const csv = parser.parse(invoices);
  
      // Set the response headers for downloading the CSV file
      res.header('Content-Type', 'text/csv');
      res.attachment('invoices.csv');  // Suggested filename for the CSV
      res.status(200).send(csv);  // Send the CSV data in the response
    } catch (err) {
      next(err);  // Pass error to the global error handler
    }
  };
