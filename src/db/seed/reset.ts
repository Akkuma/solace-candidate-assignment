import { reset } from "drizzle-seed";

import { db } from '../index.js';
import { advocates } from "../schema.js";

async function main() {
  console.warn('Reseting DB')
  await reset(db, { advocates })
  console.warn('Reset DB')
  process.exit(0)
}

main();