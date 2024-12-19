import nodemailer from "nodemailer";
import { EMAIL_ADDRESS, EMAIL_PASSWORD } from "../../config";
import fs from "node:fs";

export async function sendAlertEmail(
  recip_address: string, error: string, cronLogsPath: string) {

  if (!EMAIL_ADDRESS || !EMAIL_PASSWORD) return console.error("> [ERROR] Email credentials not provided.");

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${EMAIL_ADDRESS}`,
      pass: `${EMAIL_PASSWORD}` 
    }
  });

  // Email options
  const mailOptions = {
    from: `${EMAIL_ADDRESS}`,
    to: recip_address,
    subject: "Error in 'url-cron' execution",
    text: error,
  };

  const logStream = fs.createWriteStream(cronLogsPath, {flags: "a"});

  try {
    logStream.write(`[EMAIL - LOG] Sending email to ${recip_address}\n`);
    const req = await transporter.sendMail(mailOptions);

    logStream.write(`[EMAIL - SUCCESS] Error Alert successfully sent to email: ${EMAIL_ADDRESS}. Details:\n`);
    logStream.write(` ${req.response}\n`);

  } catch (error) {
    logStream.write(`[EMAIL - ERROR] Error trying to send alert to ${EMAIL_ADDRESS}. Details:\n`);
    logStream.write(`${error.message}\n`);

  } finally {
    logStream.end();
  }
}
