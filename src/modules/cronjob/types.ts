import { ScheduledTask } from "node-cron";

export interface DBCronjob {
  id: string,
  website: string,
  apiEndpoint: string,
  recurrence: string,
  created_at: Date,
};

export interface Cronjob {
  id: string,
  endpoint: string,
  recurrence: string,
  cronTask?: ScheduledTask | null;
}
