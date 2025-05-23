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
exports.emailHelper = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../shared/logger");
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.email.host,
    port: Number(config_1.default.email.port),
    secure: false,
    auth: {
        user: config_1.default.email.user,
        pass: config_1.default.email.pass,
    },
});
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, html }) {
    try {
        const info = yield transporter.sendMail({
            from: `"Fitness App" <${config_1.default.email.from}>`,
            to,
            subject,
            html,
        });
        logger_1.logger.info(`✅ Email sent to: ${to} - Message ID: ${info.messageId}`);
    }
    catch (error) {
        logger_1.logger.error(`❌ Email send failed to ${to}:`, error);
    }
});
exports.emailHelper = { sendEmail };
