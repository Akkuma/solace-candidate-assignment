import { seed } from "drizzle-seed";

import { db } from "../index";
import { advocates } from "../schema";
import { advocateData } from "./advocates";

const uniqueDegrees = new Set(advocateData.map((advocate) => advocate.degree));
async function main() {
  console.info("Seeding DB");
  await seed(db, { advocates }).refine((fns) => ({
    advocates: {
      count: 100_000,
      columns: {
        id: fns.intPrimaryKey(),
        firstName: fns.firstName(),
        lastName: fns.lastName(),
        city: fns.city(),
        createdAt: fns.timestamp(),
        degree: fns.valuesFromArray({ values: [...uniqueDegrees] }),
        yearsOfExperience: fns.int({ minValue: 1, maxValue: 20 }),
        phoneNumber: fns.phoneNumber(),
        // specialities eventually can be added once the new version of drizzle-seed adds support for no repeats
      },
    },
  }));
  console.info("Seeded DB");
  process.exit(0);
}
main();
