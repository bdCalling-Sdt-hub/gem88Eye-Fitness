import { Request, Response, NextFunction } from 'express';
import Invoice from './invoice.model';
import { Parser } from 'json2csv';  
import path from 'path';
import fs from 'fs'; 


export const downloadAllInvoicesCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoices = await Invoice.find();
  
      if (invoices.length === 0) {
         res.status(404).json({
          success: false,
          message: 'No invoices found to download.',
        });
      }
  
      const fields = ['invoiceId', 'client', 'className', 'contactName', 'services', 'invoiceTotal', 'invoiceNumber', 'invoiceDate', 'invoiceDueDate', 'active'];
      const opts = { fields };
  
      const parser = new Parser(opts);
      const csv = parser.parse(invoices);
  
      res.header('Content-Type', 'text/csv');
      res.attachment('invoices.csv');
      res.status(200).send(csv);
    } catch (err) {
      next(err);  
    }
  };
