"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAllInvoicesCSV = void 0;
const invoice_model_1 = __importDefault(require("./invoice.model"));
const json2csv_1 = require("json2csv");
const downloadAllInvoicesCSV = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoices = yield invoice_model_1.default.find();
        if (invoices.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No invoices found to download.',
            });
        }
        const fields = ['invoiceId', 'client', 'className', 'contactName', 'services', 'invoiceTotal', 'invoiceNumber', 'invoiceDate', 'invoiceDueDate', 'active'];
        const opts = { fields };
        const parser = new json2csv_1.Parser(opts);
        const csv = parser.parse(invoices);
        res.header('Content-Type', 'text/csv');
        res.attachment('invoices.csv');
        res.status(200).send(csv);
    }
    catch (err) {
        next(err);
    }
});
exports.downloadAllInvoicesCSV = downloadAllInvoicesCSV;
