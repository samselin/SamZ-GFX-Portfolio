import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial().primaryKey(),
  title: text().notNull(),
  category: text().notNull(),
  description: text().default(""),
  software: text("software").array().default([]),
  year: integer().default(2024),
  images: text("images").array().default([]),
  thumbnail: text().default(""),
  video: text().default(""),
  breakdowns: jsonb().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});
