import { sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: text("specialties").array().default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  // Based on https://www.mayerdan.com/programming/2017/06/26/db_phone_types &
  // https://github.com/google/libphonenumber/blob/d89d07b8dabd6b6694d55b8f17319e5caa23ef18/FALSEHOODS.md
  phoneNumber: varchar("phone_number", { length: 18 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export { advocates };
