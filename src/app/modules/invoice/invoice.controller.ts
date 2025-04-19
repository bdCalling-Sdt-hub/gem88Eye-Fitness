import { Request, Response, NextFunction } from 'express';
import Invoice from './invoice.model';
import csvParser from 'csv-parser'; 
import fs from 'fs'; 
import Client from '../contact/client.model';
import fileUploadHandler from '../../middlewares/fileUploadHandler';


export const createSingleInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { invoiceId, clientName, className, contactName, services, invoiceTotal, invoiceNumber, invoiceDate, invoiceDueDate } = req.body;
  
    if (!invoiceId || !clientName || !className || !contactName || !services || !invoiceTotal || !invoiceNumber || !invoiceDate || !invoiceDueDate) {
      res.status(400).json({ success: false, message: 'All fields are required!' });
      return;
    }
  
    try {
      const client = await Client.findOne({ client_name: clientName });
  
      if (!client) {
         res.status(404).json({ success: false, message: 'Client not found' });
         return
      }
  
      const activeStatus = client.active;
  
      const newInvoice = new Invoice({
        invoiceId,
        client: clientName,
        className,
        contactName,
        services,
        invoiceTotal,
        invoiceNumber,
        invoiceDate,
        invoiceDueDate,
        active: activeStatus, 
      });
  
      await newInvoice.save();
  
      res.status(201).json({
        success: true,
        message: 'Invoice created successfully!',
        data: newInvoice,
      });
    } catch (err) {
      next(err); 
    }
  };

const uploadCSV = fileUploadHandler(); 

export const createInvoicesFromCsv = (req: Request, res: Response, next: NextFunction): void => {
  uploadCSV(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'File upload failed',
        error: err.message,
      });
    }

    const uploadedFile = (req as any).files['documents'][0]; 
    const filePath = uploadedFile.path; 

    const invoicesData: any[] = [];

    const processCsv = async () => {
      try {
        const results = [];
        const stream = fs.createReadStream(filePath)
          .pipe(csvParser());

        for await (const row of stream) {
          const {
            invoiceId,
            clientName,
            className,
            contactName,
            services,
            invoiceTotal,
            invoiceNumber,
            invoiceDate,
            invoiceDueDate,
          } = row;

          if (!invoiceId || !clientName || !className || !contactName || !services || !invoiceTotal || !invoiceNumber || !invoiceDate || !invoiceDueDate) {
            console.error(`Invalid data in row: ${JSON.stringify(row)}`);
            continue;
          }

          const client = await Client.findOne({ client_name: clientName });

          if (!client) {
            console.error(`Client not found for clientName: ${clientName}`);
            continue;
          }

          const activeStatus = client.active;

          const newInvoice = new Invoice({
            invoiceId,
            client: clientName, 
            className,
            contactName,
            services,
            invoiceTotal,
            invoiceNumber,
            invoiceDate,
            invoiceDueDate,
            active: activeStatus, 
          });

          await newInvoice.save();
          invoicesData.push(newInvoice);
        }

        fs.unlinkSync(filePath);

        res.status(200).json({
          success: true,
          message: 'Invoices created successfully from CSV!',
          data: invoicesData,  
        });
      } catch (error) {
        fs.unlinkSync(filePath);  
        return res.status(500).json({
          success: false,
          message: 'Error while processing CSV',
          error: error,
        });
      }
    };

    processCsv();
  });
};
export const updateInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { invoiceId, clientName, className, contactName, services, invoiceTotal, invoiceNumber, invoiceDate, invoiceDueDate } = req.body;

  try {
    const invoice = await Invoice.findOne({ invoiceId });

    if (!invoice) {
       res.status(404).json({ success: false, message: 'Invoice not found' });
       return
    }

    if (clientName) {
      const client = await Client.findOne({ client_name: clientName });
      if (!client) {
         res.status(404).json({ success: false, message: 'Client not found' });
         return
      }
      invoice.client = clientName;
      invoice.active = client.active; 
    }

    if (className) invoice.className = className;
    if (contactName) invoice.contactName = contactName;
    if (services) invoice.services = services;
    if (invoiceTotal) invoice.invoiceTotal = invoiceTotal;
    if (invoiceNumber) invoice.invoiceNumber = invoiceNumber;
    if (invoiceDate) invoice.invoiceDate = invoiceDate;
    if (invoiceDueDate) invoice.invoiceDueDate = invoiceDueDate;

    const updatedInvoice = await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully!',
      data: updatedInvoice,
    });
  } catch (err) {
    next(err);  
  }
};


export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { invoiceId } = req.params; 
    const { active } = req.body; 
  
    if (typeof active !== 'boolean') {
       res.status(400).json({
        success: false,
        message: 'The active status must be a boolean value (true or false).'
        
      });
      return;
    }
  
    try {

      const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { active }, 
        { new: true } 
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
      next(err); 
    }
  };

  export const getInvoicesByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { status } = req.query; 
  
    if (status && status !== 'true' && status !== 'false') {
       res.status(400).json({
        success: false,
        message: 'Status must be either true or false.'
      });
      return
    }
  
    try {
      const invoices = await Invoice.find({
        active: status ? JSON.parse(status) : undefined, 
      });
  
      if (invoices.length === 0) {
         res.status(404).json({
          success: false,
          message: 'No invoices found with the given status.'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Invoices fetched successfully!',
        data: invoices
      });
    } catch (err) {
      next(err); 
    }
  };