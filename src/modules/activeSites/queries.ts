import { sendAlertEmail } from "../email";
import prisma from "../../../prisma/prisma";
import { DBCronjob } from "../cronjob/types";

export async function getActiveSites() {
  try {
    const activeSites = await prisma.activeSites.findMany();
    if (!activeSites) return [];

    const data = activeSites.map(d => {

      const formatedWebsite = formatToUrl(d.website!);

      return {
        ...d, 
        id: d.id.toString(),
        website: formatedWebsite, 
      }

    });

    data && console.log(`> [LOG] Endpoints pulled.`);
    data && data.forEach((x) => {
      console.log(JSON.stringify(x));
    })
    console.log("\n")
    return data;

  } catch (error) {

    console.error(`> [DATABASE ERROR] Error getting activeSites from DB. Details:`);
    console.error(` ${error.message}\n`)

    sendAlertEmail(`
      > [DATABASE ERROR] Error getting activeSites from DB. Details:
      ${error.message}\n
    `, "logs.txt");

    return [];
  }
}

export function getFakeData() {
  return [
    {
      id: "1",
      created_at: new Date(),
      website: "https://www.davidsgarage.pro",
      apiEndpoint: "api/supabase_cron_job",
      recurrence: "*/2 * * * *",
    },
    {
      id: "2",
      created_at: new Date(),
      website: "https://www.michaelmartell.com",
      apiEndpoint: "api/supabase_cron_job",
      recurrence: "*/2 * * * *",
    },
  ] as DBCronjob[]
}

function formatToUrl(domain: string): string {
  // Check if the domain already starts with a protocol
  if (!/^https?:\/\//i.test(domain)) {
      domain = `https://${domain}`;
  }

  // Check if the domain includes 'www.' after the protocol
  if (!/^(https?:\/\/)?(www\.)/i.test(domain)) {
      domain = domain.replace(/^(https?:\/\/)/i, "$1www.");
  }

  return domain;
}
