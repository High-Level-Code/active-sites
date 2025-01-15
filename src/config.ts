import dotenv from "dotenv";
dotenv.config();

export const MAIN_SCHEDULE = process.env.MAIN_SCHEDULE!;
export const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL_ADDRESS!;
export const SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD!;
export const CRONJOB_SECRET = process.env.CRONJOB_SECRET!;
export const ENVIRONMENT = process.env.ENVIRONMENT!;
