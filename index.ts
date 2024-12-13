import cron, { ScheduledTask } from "node-cron";

interface DBCronjob {
  id: string,
  website: string,
  apiEndpoint: string,
  recurrence: string,
};

interface Cronjob {
  id: string,
  endpoint: string,
  recurrence: string,
  cronTask: ScheduledTask | null;
}


const supabase = [
  {id: "cm4kzf0xk0000uzjkp57vk5qn", website: "https://routes-testing-gold.vercel.app", apiEndpoint: "api/1", recurrence: "*/4 * * * *"},
  {id: "cm4kzf0xn0001uzjkiv8ofl7b", website: "https://routes-testing-gold.vercel.app", apiEndpoint: "api/2", recurrence: "*/5 * * * *"},
  {id: "cm4kzf0xn0002uzjk80sfcx4s", website: "https://routes-testing-gold.vercel.app", apiEndpoint: "api/3", recurrence: "*/6 * * * *"},
]

const installedCronjobs: Cronjob[] = [];

cron.schedule("*/10 * * * *", () => {
  console.log(`> [LOG] Pulling endpoints from database ...`);

  let areNewOrUpdated: boolean = true;
  supabase.forEach((data: DBCronjob) => {
    // validate data

    const id = data.id;
    const endpoint = `${data.website}/${data.apiEndpoint}`;
    const recurrence = data.recurrence;

    const installedCron = installedCronjobs.find((x) => x.id === id);

    async function task() {
      try {
        // const req = await fetch(endpoint);
        // const res = await req.json();

        console.log(`> [LOG] Simulating a request to ${endpoint}. [${new Date()}]`);
        // console.log(`> [LOG] A request to ${endpoint} was made.`);
        // console.log(` status: ${req.status}`);
        // console.log(` body: ${JSON.stringify(res)}`);
        console.log(` cronjob details: ${JSON.stringify({id, endpoint, recurrence})}`);

      } catch (error) {
        console.log(`> [LOG] A request to ${endpoint} failed [${new Date()}]. Error:`);
        console.log(` ${error}`);
        console.error(error);
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
      
      console.log(`> [LOG] cronjob with id ${id} was successfully installed [${new Date()}]`);
      console.log(newCron);
      areNewOrUpdated = true;
    }

    if (installedCron && (
        endpoint !== installedCron.endpoint ||
        recurrence !== installedCron.recurrence)
    ) {
      console.log(`> [LOG] cronjob with id ${id} is being updated [${new Date()}]:`);
      console.log(` endpoint: ${installedCron.endpoint} -> ${endpoint}`);
      console.log(` recurrence: ${installedCron.recurrence} -> ${recurrence}`);

      installedCron.cronTask!.stop();
      installedCron.cronTask = null;

      installedCron.endpoint = `${data.website}/${data.apiEndpoint}`;
      installedCron.cronTask = cron.schedule(data.recurrence, task);

      areNewOrUpdated = true
    }
    
    areNewOrUpdated = false;
  });
  if (!areNewOrUpdated) return console.log(`\n> [LOG] No new or updated cronjobs.\n`);

  console.log(`> [LOG] Cronjobs installed [${new Date()}]:`);
  console.log(installedCronjobs);
})
