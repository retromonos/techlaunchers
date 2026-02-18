import { boolean } from "drizzle-orm/gel-core";
import { integer, pgTable, varchar, date, uuid } from "drizzle-orm/pg-core";

export const launchTable = pgTable("launches", {
    id: uuid().primaryKey().notNull().defaultRandom(),
    authorId: varchar().notNull(),
    name: varchar({ length: 255 }).notNull(),
    desc: varchar().notNull(),
    time: date().notNull(),
    takeBack: boolean().notNull()
});

export const participationTable = pgTable("participants", {
    id: uuid().primaryKey().notNull().defaultRandom(),
    launchId: uuid().notNull(),
    userId: varchar().notNull(),
    isDriver: boolean().default(false),
    name: varchar().notNull()
});
