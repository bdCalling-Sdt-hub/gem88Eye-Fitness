// src/app/routes/invoiceRoutes.ts
import express from 'express';
import multer from 'multer';  // To handle file uploads
import { createSingleInvoice, createMultipleInvoices, updateInvoiceStatus, getInvoicesByStatus } from './invoice.controller';
import { downloadAllInvoicesCSV } from './download.csv';

const invoiceRoutes = express.Router();

// Set up file upload using multer
const upload = multer({ dest: 'uploads/csv/' });  // Folder where CSV files will be stored

// Route for creating a single invoice (POST request)
invoiceRoutes.post('/single', createSingleInvoice);

// Route for creating multiple invoices from a CSV (POST request)
invoiceRoutes.post('/multiple', upload.single('file'), createMultipleInvoices); 
invoiceRoutes.put('/status/:invoiceId', updateInvoiceStatus);
invoiceRoutes.get('/', getInvoicesByStatus);
invoiceRoutes.get('/csv/download', downloadAllInvoicesCSV);

export default invoiceRoutes;
