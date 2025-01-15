import fs from "node:fs";
import { CRONJOB_SECRET } from "../../config";
import { sendAlertEmail } from "../email";

export function generateTask(endpoint: string, id: string, recurrence: string) {
  async function task() {

    const logPath = `url-logs/${id}.txt`;

    const secret = CRONJOB_SECRET;
    if (!secret) return fs.appendFileSync(logPath,`> [ERROR] No secret was provided for authorization.\n`);

    try {
      const req = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${secret}`,
        },
        method: "POST"
      });

      if (!req.ok) {
        const body = await req.text() ? JSON.stringify(await req.json()) : "no body returned";
        const error = `> [Error] Request failed (${new Date()}). Details:
          status: ${req.status}
          body: ${body}\n
        `;

        fs.appendFileSync(logPath, error);
        sendAlertEmail(error, logPath);
        return;
      }

      const res = await req.text() ? await req.json() : undefined;

      const text = `> [Cron-${id}] Request successfully sent to ${endpoint}.Details:
          at: ${new Date()}
          status: ${req.status}
          body: ${ res ? JSON.stringify(res) : "No body returned"}
          cronjob details: ${JSON.stringify({id, endpoint, recurrence})}\n
      `;

      fs.appendFileSync(logPath, text);

    } catch (error) {

      const errorText = `
        > [Error] Error trying to fetch endpoint: ${endpoint}. [${new Date()}]. Error details:
        ${error}
      `;
      fs.appendFileSync(logPath, errorText);
      sendAlertEmail(errorText, logPath);
    }

  }

  return task;
}
