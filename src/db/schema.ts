import { type SQL, sql } from "drizzle-orm";
import { customType, index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return `tsvector`;
  },
});
const advocates = pgTable(
  "advocates",
  {
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
    search: tsvector("search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`setweight(to_tsvector('english', ${advocates.firstName}), 'A')
        ||
        setweight(to_tsvector('english', ${advocates.lastName}), 'A')
        ||
        setweight(to_tsvector('english', ${advocates.city}), 'B')
        ||
        setweight(to_tsvector('english', ${advocates.degree}), 'D')
        ||
        setweight(to_tsvector('english', ${advocates.phoneNumber}), 'C')
        ||
        setweight(to_tsvector('english', ${advocates.yearsOfExperience}::text), 'D')
        ||
        setweight(array_to_tsvector(${advocates.specialties}), 'C')`,
      ),
  },
  (t) => [index("idx_advocates_search").using("gin", t.search)],
);

export { advocates };
