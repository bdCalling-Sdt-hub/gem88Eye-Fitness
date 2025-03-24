// src/app/controllers/invoice.controller.ts
import { Request, Response, NextFunction } from 'express';
import Invoice from './invoice.model';
import csvParser from 'csv-parser';  // A library for parsing CSV files
import fs from 'fs'; // Used to handle file uploads
import Client from '../contact/client.model';

// Controller to create a single invoice
export const createSingleInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { invoiceId, clientName, className, contactName, services, invoiceTotal, invoiceNumber, invoiceDate, invoiceDueDate } = req.body;
  
    if (!invoiceId || !clientName || !className || !contactName || !services || !invoiceTotal || !invoiceNumber || !invoiceDate || !invoiceDueDate) {
      res.status(400).json({ success: false, message: 'All fields are required!' });
      return;
    }
  
    try {
      // Fetch the client based on the client name
      const client = await Client.findOne({ client_name: clientName });
  
      if (!client) {
         res.status(404).json({ success: false, message: 'Client not found' });
         return
      }
  
      // Ensure that we correctly assign the 'active' status from the client model
      const activeStatus = client.active;
  
      // Create the new invoice, including the active status from the client
      const newInvoice = new Invoice({
        invoiceId,
        client: clientName,  // Store client name in the invoice
        className,
        contactName,
        services,
        invoiceTotal,
        invoiceNumber,
        invoiceDate,
        invoiceDueDate,
        active: activeStatus,  // Get the active status of the client
      });
  
      await newInvoice.save();
  
      res.status(201).json({
        success: true,
        message: 'Invoice created successfully!',
        data: newInvoice,
      });
    } catch (err) {
      next(err);  // Pass the error to the global error handler
    }
  };
// Controller to create multiple invoices from a CSV file
export const createMultipleInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const file = req.file; // Access the uploaded file

  if (!file) {
     res.status(400).json({
      success: false,
      message: 'Please upload a CSV file.'
      
    });
    return
  }

  const invoices: any[] = [];

  // Parse the CSV file
  fs.createReadStream(file.path)
    .pipe(csvParser())
    .on('data', async (row: { invoiceId: any; client: any; className: any; contactName: any; services: any; invoiceTotal: any; invoiceNumber: any; invoiceDate: any; invoiceDueDate: any; }) => {
      const { invoiceId, client, className, contactName, services, invoiceTotal, invoiceNumber, invoiceDate, invoiceDueDate } = row;

      const newInvoice = new Invoice({
        invoiceId,
        client,
        className,
        contactName,
        services,
        invoiceTotal: parseFloat(invoiceTotal),
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        invoiceDueDate: new Date(invoiceDueDate),
      });

      invoices.push(newInvoice);
    })
    .on('end', async () => {
      try {
        // Insert multiple invoices into the database
        await Invoice.insertMany(invoices);
        res.status(201).json({
          success: true,
          message: `${invoices.length} invoices created successfully!`
        });
      } catch (err) {
        next(err);
      }
    })
    .on('error', (err: any) => {
      next(err);
    });
};


//active-inactive
export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { invoiceId } = req.params;  // Get the invoice ID from the URL
    const { active } = req.body;  // Get the new active status from the request body
  
    if (typeof active !== 'boolean') {
       res.status(400).json({
        success: false,
        message: 'The active status must be a boolean value (true or false).'
        
      });
      return;
    }
  
    try {
      // Find the invoice by ID and update the active status
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId, // Find by invoice ID
        { active },  // Update active status
        { new: true }  // Return the updated invoice
      );
  
      if (!updatedInvoice) {
         res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
        return
      }
  
      res.status(200).json({
        success: true,
        message: `Invoice status updated to ${active ? 'active' : 'inactive'}`,
        data: updatedInvoice
      });
    } catch (err) {
      next(err);  // Pass the error to the global error handler
    }
  };

  export const getInvoicesByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { status } = req.query;  // Get the status (active/inactive) from the query string
  
    // Ensure the status is a valid value
    if (status && status !== 'true' && status !== 'false') {
       res.status(400).json({
        success: false,
        message: 'Status must be either true or false.'
      });
      return
    }
  
    try {
      // If status is provided, filter invoices based on the active status
      const invoices = await Invoice.find({
        active: status ? JSON.parse(status) : undefined  // If status is passed, filter by status
      });
  
      // If no invoices are found
      if (invoices.length === 0) {
         res.status(404).json({
          success: false,
          message: 'No invoices found with the given status.'
        });
      }
  
      // Return the filtered invoices
      res.status(200).json({
        success: true,
        message: 'Invoices fetched successfully!',
        data: invoices
      });
    } catch (err) {
      next(err);  // Pass the error to the global error handler
    }
  };