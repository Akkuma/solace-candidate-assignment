import { seed } from "drizzle-seed";

import { db } from "../index";
import { advocates } from "../schema";
import { advocateData } from "./advocates";

const uniqueDegrees = new Set(advocateData.map((advocate) => advocate.degree));
const uniqueCities = new Set(advocateData.map((advocate) => advocate.city));

const seedCount = process.env.SEED_COUNT ? parseInt(process.env.SEED_COUNT) : 100_000;
async function main() {
  console.info("Seeding DB");
  await seed(db, { advocates }).refine((fns) => ({
    advocates: {
      count: seedCount,
      columns: {
        id: fns.intPrimaryKey(),
        firstName: fns.firstName(),
        lastName: fns.lastName(),
        city: fns.valuesFromArray({ values: [...uniqueCities] }),
        createdAt: fns.timestamp(),
        degree: fns.valuesFromArray({ values: [...uniqueDegrees] }),
        yearsOfExperience: fns.int({ minValue: 1, maxValue: 20 }),
        phoneNumber: fns.phoneNumber({
          prefixes: ["+1562", "+1732", "+1212", "+1505"],
          generatedDigitsNumbers: 7,
        }),
        specialties: fns.jobTitle({ arraySize: 4 }),
        // This is a placeholder so seeding can still work
        search: fns.string(),
      },
    },
  }));
  console.info("Seeded DB");
  process.exit(0);
}
main();
