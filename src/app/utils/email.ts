/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../../config/env";
import AppError from "../error-helpers/app-error";
import { ISendMailOptions } from "../interfaces/send-mail-option.interface";

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER_SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER_SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
});

export const sendMail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: ISendMailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER_SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    if (envVars.NODE_ENV === "development") {
      console.log(
        `📧 [${new Date().toISOString()}] EMAIL SENT → To: ${to} | ID: ${info.messageId}`,
      );
    }
  } catch (error: any) {
    const message = error.message || "Failed to send mail";
    throw new AppError(status.INTERNAL_SERVER_ERROR, message);
  }
};
