import dotenv from "dotenv";
dotenv.config();

export const MAIN_SCHEDULE = process.env.SCRIPT_SCHEDULE;
export const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const CRONJOB_SECRET = process.env.CRONJOB_SECRET;
