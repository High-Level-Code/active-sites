import { ScheduledTask } from "node-cron";

export interface DBCronjob {
  id: string,
  website: string,
  apiEndpoint: string,
  recurrence: string,
  createdAt: Date,
  updatedAt: Date
};

export interface Cronjob {
  id: string,
  endpoint: string,
  recurrence: string,
  cronTask?: ScheduledTask | null;
}
