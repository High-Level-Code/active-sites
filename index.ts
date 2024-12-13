import * as dotenv from "dotenv";
import cron, { ScheduledTask } from "node-cron";
import prisma from "./prisma/prisma";

dotenv.config();

interface DBCronjob {
  id: string,
  website: string,
  apiEndpoint: string,
  recurrence: string,
  createdAt: Date,
  updatedAt: Date
};

interface Cronjob {
  id: string,
  endpoint: string,
  recurrence: string,
  cronTask: ScheduledTask | null;
}

async function getActiveSites() {
  try {
    return await prisma.activeSites.findMany();
  } catch (error) {
    console.error(`> [DATABASE ERROR] Details:`);
    console.error(` ${error}\n`)
  }
}


const supabase = await getActiveSites() || [];

const installedCronjobs: Cronjob[] = [];

cron.schedule("*/10 * * * *", () => {
  console.log(`> [LOG] Pulling endpoints from database ...`);

  // remove not listed cronjobs in the database
  installedCronjobs.forEach((job: Cronjob, index) => {

    const inDB = supabase.find((x) => x.id === job.id);
    if (inDB) return;

    job.cronTask!.stop();
    job.cronTask = null;
    installedCronjobs.splice(index, 1);
    console.log(`> [LOG] Removed cronjob with id ${job.id}. Cronjob details:`);
    console.log(`${JSON.stringify(job)}\n`);
  });

  let areNewOrUpdated: boolean = true;
  supabase.forEach((data: DBCronjob) => {
    // validate data

    const id = data.id;
    const endpoint = `${data.website}/${data.apiEndpoint}`;
    const recurrence = data.recurrence;

    const installedCron = installedCronjobs.find((x) => x.id === id);

    async function task() {
      try {
        const secret = process.env.CRONJOB_SECRET;
        if (!secret) return console.log(`> [ERROR] No secret was provided for authorization.\n`);
        const req = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${secret}`,
          },
          method: "POST"
        });
        const res = await req.json();

        console.log(`> [CRONJOB - ${id}] A request to ${endpoint} was made.`);
        console.log(` status: ${req.status}`);
        console.log(` body: ${JSON.stringify(res)}`);
        console.log(` cronjob details: ${JSON.stringify({id, endpoint, recurrence})}\n`);

      } catch (error) {
        console.error(`> [CRONJOB ERROR] A request to ${endpoint} failed [${new Date()}]. Error:`);
        console.error(` ${error}\n`);
        // send a message to client's email
      }
    }

    if (!installedCron) {
      
      const newCron = {
        id,
        endpoint,
        recurrence,
        cronTask: cron.schedule(data.recurrence, task)
      };

      installedCronjobs.push(newCron);
      
      console.log(`> [LOG] cronjob with id ${id} was successfully installed - at ${new Date()} - Details:`);
      console.log(JSON.stringify(newCron), "\n");
      areNewOrUpdated = true;
      return;
    }

    if (installedCron && (
        endpoint !== installedCron.endpoint ||
        recurrence !== installedCron.recurrence)
    ) {
      console.log(`> [LOG] cronjob with id ${id} is being updated [${new Date()}]:`);
      console.log(` endpoint: ${installedCron.endpoint} -> ${endpoint}`);
      console.log(` recurrence: ${installedCron.recurrence} -> ${recurrence}\n`);

      installedCron.cronTask!.stop();
      installedCron.cronTask = null;

      installedCron.endpoint = `${data.website}/${data.apiEndpoint}`;
      installedCron.cronTask = cron.schedule(data.recurrence, task);

      areNewOrUpdated = true
    }
    
    areNewOrUpdated = false;
    return;
  });

  if (!areNewOrUpdated) return console.log(`\n> [LOG] No new or updated cronjobs.\n`);

  console.log(`> [LOG] Cronjobs installed [${new Date()}]:`);
  installedCronjobs.forEach((job: Cronjob) => {
    console.log(JSON.stringify(job));
  });
  console.log("\n")
});
