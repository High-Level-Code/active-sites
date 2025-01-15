import nodemailer from "nodemailer";
import fs from "node:fs";
import { ENVIRONMENT, SENDER_EMAIL_ADDRESS, SENDER_EMAIL_PASSWORD } from "../../config";

export async function sendAlertEmail(error: string, path: string) {

  if (!SENDER_EMAIL_ADDRESS || !SENDER_EMAIL_PASSWORD) return console.error("> [ERROR] Email credentials not provided.");

  const recipients = ENVIRONMENT.startsWith("prod") ?
    ["hierrofernandes23@gmail.com", "240designworks@gmail.com"] :
    "hierrofernandes23@gmail.com"

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${SENDER_EMAIL_ADDRESS}`,
      pass: `${SENDER_EMAIL_PASSWORD}` 
    }
  });

  // Email options
  const mailOptions = {
    from: `${SENDER_EMAIL_ADDRESS}`,
    to: recipients,
    subject: "Error in 'active-sites' execution",
    text: error,
  };

  const logStream = fs.createWriteStream(path, {flags: "a"});

  try {
    logStream.write(`> [Email] Sending email to '${recipients}'\n`);
    const req = await transporter.sendMail(mailOptions);

    logStream.write(`> [Email] Success! Error Alert successfully sent to email: ${recipients}. Details:\n`);
    logStream.write(` ${req.response}\n`);

  } catch (error) {
    logStream.write(`> [Email] Failed! Error trying to send alert to '${recipients}'. Details:\n`);
    logStream.write(`${error.message}\n`);

  } finally {
    logStream.end();
  }
}
