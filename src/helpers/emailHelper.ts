import nodemailer from "nodemailer";
import config from "../config";
import { logger } from "../shared/logger";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Simply Good Food" <${config.email.from}>`,
      to,
      subject,
      html,
    });

    logger.info(`✅ Email sent to: ${to} - Message ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`❌ Email send failed to ${to}:`, error);
  }
};

export const emailHelper = { sendEmail };
