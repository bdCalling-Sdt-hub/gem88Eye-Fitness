import express from 'express';
import multer from 'multer'; 
import { createSingleInvoice, updateInvoiceStatus, getInvoicesByStatus, createInvoicesFromCsv, updateInvoice, deleteInvoice } from './invoice.controller';
import { downloadAllInvoicesCSV } from './download.csv';

const invoiceRoutes = express.Router();

const upload = multer({ dest: 'uploads/csv/' });  

invoiceRoutes.post('/single', createSingleInvoice);

invoiceRoutes.post('/multiple', createInvoicesFromCsv); 
invoiceRoutes.put('/status/:invoiceId', updateInvoiceStatus);
invoiceRoutes.get('', getInvoicesByStatus);
invoiceRoutes.get('/csv/download', downloadAllInvoicesCSV);
invoiceRoutes.put('/update/:invoiceId',updateInvoice);
invoiceRoutes.delete('/delete/:invoiceId', deleteInvoice)

export default invoiceRoutes;
