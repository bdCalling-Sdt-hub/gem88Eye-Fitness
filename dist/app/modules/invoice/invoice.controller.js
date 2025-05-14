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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoicesByStatus = exports.deleteInvoice = exports.updateInvoiceStatus = exports.updateInvoice = exports.createInvoicesFromCsv = exports.createSingleInvoice = void 0;
const invoice_model_1 = __importDefault(require("./invoice.model"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const client_model_1 = __importDefault(require("../contact/client.model"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const uploadCSV = (0, fileUploadHandler_1.default)();
const createSingleInvoice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId, className, contactName, services, invoiceTotal, invoiceNumber, invoiceDate, invoiceDueDate } = req.body;
    if (!clientId || !className || !contactName || !services || !invoiceTotal || !invoiceNumber || !invoiceDate || !invoiceDueDate) {
        res.status(400).json({ success: false, message: 'All fields are required!' });
        return;
    }
    try {
        const client = yield client_model_1.default.findById(clientId);
        if (!client) {
            res.status(404).json({ success: false, message: 'Client not found' });
            return;
        }
        const activeStatus = client.active;
        const newInvoice = new invoice_model_1.default({
            client: client._id,
            className,
            contactName,
            services,
            invoiceTotal,
            invoiceNumber,
            invoiceDate,
            invoiceDueDate,
            active: activeStatus,
        });
        yield newInvoice.save();
        const populatedInvoice = yield invoice_model_1.default.findById(newInvoice._id).populate('client');
        res.status(201).json({
            success: true,
            message: 'Invoice created successfully!',
            data: populatedInvoice,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createSingleInvoice = createSingleInvoice;
const createInvoicesFromCsv = (req, res, next) => {
    uploadCSV(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'File upload failed',
                error: err.message,
            });
        }
        const uploadedFile = req.files['documents'][0];
        const filePath = uploadedFile.path;
        const invoicesData = [];
        const processCsv = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            try {
                const results = [];
                const stream = fs_1.default.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)());
                try {
                    for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                        _c = stream_1_1.value;
                        _d = false;
                        const row = _c;
                        const { clientName, className, contactName, services, invoiceTotal, invoiceNumber, invoiceDate, invoiceDueDate, } = row;
                        if (!clientName || !className || !contactName || !services || !invoiceTotal || !invoiceNumber || !invoiceDate || !invoiceDueDate) {
                            console.error(`Invalid data in row: ${JSON.stringify(row)}`);
                            continue;
                        }
                        const client = yield client_model_1.default.findOne({ name: clientName });
                        if (!client) {
                            console.error(`Client not found for clientName: ${clientName}`);
                            continue;
                        }
                        const activeStatus = client.active;
                        const newInvoice = new invoice_model_1.default({
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
                        yield newInvoice.save();
                        invoicesData.push(newInvoice);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                fs_1.default.unlinkSync(filePath);
                res.status(200).json({
                    success: true,
                    message: 'Invoices created successfully from CSV!',
                    data: invoicesData,
                });
            }
            catch (error) {
                fs_1.default.unlinkSync(filePath);
                return res.status(500).json({
                    success: false,
                    message: 'Error while processing CSV',
                    error: error,
                });
            }
        });
        processCsv();
    });
};
exports.createInvoicesFromCsv = createInvoicesFromCsv;
const updateInvoice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { invoiceId } = req.params;
    const { clientId, className, contactName, services, invoiceTotal, invoiceNumber, invoiceDate, invoiceDueDate } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(invoiceId)) {
            res.status(400).json({ success: false, message: 'Invalid invoiceId' });
            return;
        }
        const invoice = yield invoice_model_1.default.findById(invoiceId);
        if (!invoice) {
            res.status(404).json({ success: false, message: 'Invoice not found' });
            return;
        }
        if (clientId) {
            const client = yield client_model_1.default.findById(clientId);
            if (!client) {
                res.status(404).json({ success: false, message: 'Client not found' });
                return;
            }
            invoice.client = client._id;
            invoice.active = client.active;
        }
        if (className)
            invoice.className = className;
        if (contactName)
            invoice.contactName = contactName;
        if (services)
            invoice.services = services;
        if (invoiceTotal)
            invoice.invoiceTotal = invoiceTotal;
        if (invoiceNumber)
            invoice.invoiceNumber = invoiceNumber;
        if (invoiceDate)
            invoice.invoiceDate = invoiceDate;
        if (invoiceDueDate)
            invoice.invoiceDueDate = invoiceDueDate;
        const updatedInvoice = yield invoice.save();
        res.status(200).json({
            success: true,
            message: 'Invoice updated successfully!',
            data: updatedInvoice,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateInvoice = updateInvoice;
const updateInvoiceStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updatedInvoice = yield invoice_model_1.default.findByIdAndUpdate(invoiceId, { active }, { new: true });
        if (!updatedInvoice) {
            res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `Invoice status updated to ${active ? 'active' : 'inactive'}`,
            data: updatedInvoice
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateInvoiceStatus = updateInvoiceStatus;
const deleteInvoice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { invoiceId } = req.params;
    try {
        const deletedInvoice = yield invoice_model_1.default.findByIdAndDelete(invoiceId);
        if (!deletedInvoice) {
            res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully!',
            data: deletedInvoice
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteInvoice = deleteInvoice;
const getInvoicesByStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    if (status && status !== 'true' && status !== 'false') {
        res.status(400).json({
            success: false,
            message: 'Status must be either true or false.'
        });
        return;
    }
    try {
        const invoices = yield invoice_model_1.default.find({
            active: status ? JSON.parse(status) : undefined,
        }).populate('client');
        console.log(invoices);
        if (invoices.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No invoices found with the given status.'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Invoices fetched successfully!',
            data: invoices
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getInvoicesByStatus = getInvoicesByStatus;
