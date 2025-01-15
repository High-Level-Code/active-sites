import { ScheduledTask } from "node-cron";

export interface DBCronjob {
  id: string,
  created_at: Date,
  website?: string | null,
  apiEndpoint: string | null,
  recurrence?: string | null,
}

export interface Cronjob {
  id: string,
  endpoint: string,
  recurrence: string,
  cronTask?: ScheduledTask | null;
}
