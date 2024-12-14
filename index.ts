import * as dotenv from "dotenv";
import cron, { ScheduledTask } from "node-cron";
import prisma from "./prisma/prisma";
import fs from "node:fs";

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
  cronTask?: ScheduledTask | null;
}

async function getActiveSites() {
  try {
    const data = await prisma.activeSites.findMany();
    data && console.log(`> [LOG] Endpoints pulled.`);
    data && data.forEach((x) => {
      console.log(JSON.stringify(x));
    })
    console.log("\n")
    return data;
  } catch (error) {
    console.error(`> [DATABASE ERROR] Details:`);
    console.error(` ${error}\n`)
    throw new Error(error);
  }
}


const installedCronjobs: Cronjob[] = [];

cron.schedule("*/4 * * * *", async () => {
  console.log(">> Executing main cronjob ..");
  console.log(`> [LOG] Pulling endpoints from database ...`);
  const supabase = await getActiveSites() || [];

  // remove not listed cronjobs in the database
  console.log(`> [LOG] Checking already insalled cronjobs:`);
  installedCronjobs.length === 0 && console.log(" empty ...");
  installedCronjobs.length > 0 && installedCronjobs.forEach((job: Cronjob, index: number) => {
 
    const id = `${job.id}`;
    const details = JSON.stringify({id: job.id, endpoint: job.endpoint, recurrence: job.recurrence});   
    console.log(`${details}`);

    const inDB = supabase.find((x) => x.id === job.id);
    if (inDB) return;


    job.cronTask!.stop();
    job.cronTask = null;
    delete job.cronTask;
    
    installedCronjobs.splice(index, 1);
    console.log(`> [SUCCESS] Removed cronjob with id ${job.id}. Cronjob details:`);
    console.log(`${details}\n`);
    try {
      fs.unlinkSync(`url-logs/${id}.txt`);
      console.log(`> [SUCCESS] Log file 'url-logs/${id}.txt' deleted.`)
    } catch (error) {
      console.error(`> [ERROR] Error deleting log file 'url-logs/${id}.txt'`)
    }
  });
  console.log("\n");


  console.log(`> [LOG] Checking each pulled ednpoint:`);

  let update = false;
  supabase.forEach((data: DBCronjob, index: number) => {

    // validate data
    console.log(`>>> index ${index}`);
    console.log(`--> Data: `, data);
    const id = data.id;
    const endpoint = `${data.website}/${data.apiEndpoint}`;
    const recurrence = data.recurrence;
   
    if (!cron.validate(recurrence)) return console.log(`>>> ${recurrence} - is not a valid schedule expression. Skipping ..`);

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

        /**
        console.log(`> [CRONJOB - ${id}] A request to ${endpoint} was made.`);
        console.log(` at: ${new Date()}`);
        console.log(` status: ${req.status}`);
        console.log(` body: ${JSON.stringify(res)}`);
        console.log(` cronjob details: ${JSON.stringify({id, endpoint, recurrence})}\n`);
        **/

        fs.appendFileSync(`url-logs/${id}.txt`, `
          > [CRONJOB - ${id}] A request to ${endpoint} was made.
            at: ${new Date()}
            status: ${req.status}
            body: ${JSON.stringify(res)}
            cronjob details: ${JSON.stringify({id, endpoint, recurrence})}\n
        `);

      } catch (error) {
        /**
        console.error(`> [CRONJOB ERROR] A request to ${endpoint} failed [${new Date()}]. Error:`);
        console.error(` ${error}\n`);
        **/

        fs.appendFileSync(`url-logs/${id}.txt`, `
          > [CRONJOB ERROR] A request to ${endpoint} failed [${new Date()}]. Error:
            ${error}\n
        `);
        // send a message to client's email
      }
    }

    if (!installedCron) {
      
      installedCronjobs.push({
        id,
        endpoint,
        recurrence,
        cronTask: cron.schedule(data.recurrence, task)
      });
      
      console.log(`--> Endpoint successfully installed as a cronjob - at ${new Date()} - Details:`);
      console.log(`     id: ${id}`);
      console.log(`     endpoint: ${endpoint}`);
      console.log(`     recurrence: ${recurrence}`);

      fs.appendFileSync(`url-logs/${id}.txt`, `File created at ${new Date()}\n`);
      return;
    }

    if (installedCron) {
      console.log("--> Pulled endpoint located in installed cronjob. Checking for updateds...");
      console.log(` - endpoint updated? 
                  installed = ${installedCron.endpoint} 
                  puled = ${endpoint}
      `);
      console.log(` - recurrence updated? 
                  installed = ${installedCron.recurrence} 
                  puled = ${recurrence}
      `);
      if (endpoint === installedCron.endpoint && recurrence === installedCron.recurrence) 
        return console.log(`--> Nothing to update. skipping ..`);
      console.log(`--> Cronjob with id ${id} is being updated [${new Date()}]:`);
      console.log(`   endpoint: ${installedCron.endpoint} -> ${endpoint}`);
      console.log(`   recurrence: ${installedCron.recurrence} -> ${recurrence}\n`);

      fs.appendFileSync(`url-logs/${id}.txt`, `
        [CRONJOB] Cronjob was updated at - ${new Date()}. Details:
          endpoint: ${installedCron.endpoint} -> ${endpoint}
          recurrence: ${installedCron.recurrence} -> ${recurrence}\n
      `)

      installedCron.cronTask!.stop();
      installedCron.cronTask = null;
      delete installedCron.cronTask;

      installedCron.endpoint = `${data.website}/${data.apiEndpoint}`;
      installedCron["cronTask"] = cron.schedule(data.recurrence, task);
      update = true;
      return;
    }
    
  });

  if (installedCronjobs.length === 0) console.log(`\n> [LOG] No new cronjobs installed.\n`);
  if (!update) console.log(`\n> [LOG] No cronjob updates made.\n`);

  console.log(`> [LOG] Cronjobs installed [${new Date()}]:`);
  installedCronjobs.forEach((job: Cronjob) => {
    if (!job) return console.log("no cronjob");
    console.log(JSON.stringify({id: job.id, endpoint: job.endpoint, recurrence: job.recurrence}));
  });
  console.log("\n");
  console.log(">> End of main cronjob execution");
  console.log("\n");
});

console.log(`> [LOG] Main cronjob installed successfully - at ${new Date()}\n`);
