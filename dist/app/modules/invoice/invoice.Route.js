"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const invoice_controller_1 = require("./invoice.controller");
const download_csv_1 = require("./download.csv");
const invoiceRoutes = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/csv/' });
invoiceRoutes.post('/single', invoice_controller_1.createSingleInvoice);
invoiceRoutes.post('/multiple', invoice_controller_1.createInvoicesFromCsv);
invoiceRoutes.put('/status/:invoiceId', invoice_controller_1.updateInvoiceStatus);
invoiceRoutes.get('', invoice_controller_1.getInvoicesByStatus);
invoiceRoutes.get('/csv/download', download_csv_1.downloadAllInvoicesCSV);
invoiceRoutes.put('/update/:invoiceId', invoice_controller_1.updateInvoice);
invoiceRoutes.delete('/delete/:invoiceId', invoice_controller_1.deleteInvoice);
exports.default = invoiceRoutes;
