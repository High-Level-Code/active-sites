import fs from "node:fs";
import { CRONJOB_SECRET, EMAIL_ADDRESS } from "../../config";
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
      const res = await req.json();

      const text = `> [CRONJOB - ${id}] A request to ${endpoint} was made.
          at: ${new Date()}
          status: ${req.status}
          body: ${JSON.stringify(res)}
          cronjob details: ${JSON.stringify({id, endpoint, recurrence})}\n`;

      fs.appendFileSync(logPath, text);
      if (!req.ok) sendAlertEmail(EMAIL_ADDRESS!, text, logPath);

    } catch (error) {

      const text = `
        > [CRONJOB ERROR] A request to ${endpoint} failed [${new Date()}]. Error details:
          ${error}\n
      `;
      fs.appendFileSync(logPath, text);
      sendAlertEmail(EMAIL_ADDRESS!, text, logPath);
    }

  }

  return task;
}
