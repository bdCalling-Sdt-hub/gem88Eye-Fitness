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
exports.sendEmailToLeadOrClients = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const moment_1 = __importDefault(require("moment"));
const client_model_1 = __importDefault(require("./client.model"));
const leads_model_1 = __importDefault(require("./leads.model"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'azizulhoq4305@gmail.com',
        pass: 'igidksaeqbnfqkeh'
    }
});
const sendEmailToLeadOrClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const lead = yield leads_model_1.default.findById(leadId);
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
            yield transporter.sendMail(mailOptions);
            res.status(200).json({
                success: true,
                message: `Email sent successfully to lead: ${lead.client_email}`,
            });
            return;
        }
        else {
            let dateFilter;
            if (timeInterval === '1 week') {
                dateFilter = (0, moment_1.default)().subtract(1, 'weeks').toDate();
            }
            else if (timeInterval === '1 month') {
                dateFilter = (0, moment_1.default)().subtract(1, 'months').toDate();
            }
            else if (timeInterval === '1 year') {
                dateFilter = (0, moment_1.default)().subtract(1, 'years').toDate();
            }
            else if (timeInterval === 'all') {
                dateFilter = null;
            }
            else {
                res.status(400).json({ success: false, message: 'Invalid time interval.' });
                return;
            }
            let clients;
            if (dateFilter) {
                clients = yield client_model_1.default.find({ createdAt: { $gte: dateFilter } });
            }
            else {
                clients = yield client_model_1.default.find(); // All clients
            }
            if (clients.length === 0) {
                res.status(404).json({ success: false, message: 'No clients found for the selected time interval.' });
                return;
            }
            // Send email to each client asynchronously using Promise.all for efficiency
            const emailPromises = clients.map((client) => __awaiter(void 0, void 0, void 0, function* () {
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
                yield transporter.sendMail(mailOptions);
            }));
            // Wait for all email promises to resolve
            yield Promise.all(emailPromises);
            res.status(200).json({
                success: true,
                message: `Emails sent to ${clients.length} clients successfully!`,
            });
            return;
        }
    }
    catch (err) {
        next(err);
    }
});
exports.sendEmailToLeadOrClients = sendEmailToLeadOrClients;
