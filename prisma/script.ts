import prisma from "./prisma";

(async () => {

  try {
    await prisma.activeSites.createMany({
      data: [
        {website: "https://routes-testing-gold.vercel.app", apiEndpoint: "api/1", reocurrance: "*/10 * * * *"},
        {website: "https://routes-testing-gold.vercel.app", apiEndpoint: "api/2", reocurrance: "*/11 * * * *"},
        {website: "https://routes-testing-gold.vercel.app", apiEndpoint: "api/3", reocurrance: "*/12 * * * *"}
      ]
    })
  } catch (error) {
    console.error(error);
  }

})();
