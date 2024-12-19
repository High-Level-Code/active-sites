import { sendAlertEmail } from "../email";
import prisma from "../../../prisma/prisma";
import { EMAIL_ADDRESS } from "../../config";

export async function getActiveSites() {
  try {
    const data = await prisma.activeSites.findMany();
    data && console.log(`> [LOG] Endpoints pulled.`);
    data && data.forEach((x) => {
      console.log(JSON.stringify(x));
    })
    console.log("\n")
    return data;
  } catch (error) {
    console.error(`> [DATABASE ERROR] Error getting activeSites from DB. Details:`);
    console.error(` ${error.message}\n`)
    sendAlertEmail(EMAIL_ADDRESS!, `
      > [DATABASE ERROR] Error getting activeSites from DB. Details:
      ${error.message}\n
    `, "logs.txt");
    return [];
  }
}
