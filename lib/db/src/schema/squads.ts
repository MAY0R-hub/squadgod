import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { playersTable } from "./players";

export const squadsTable = pgTable("squads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  formation: text("formation").notNull().default("4-3-3"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const squadPlayersTable = pgTable("squad_players", {
  id: serial("id").primaryKey(),
  squadId: integer("squad_id").notNull().references(() => squadsTable.id, { onDelete: "cascade" }),
  playerId: integer("player_id").notNull().references(() => playersTable.id, { onDelete: "cascade" }),
  positionSlot: text("position_slot").notNull(),
});

export const insertSquadSchema = createInsertSchema(squadsTable).omit({ id: true, createdAt: true });
export type InsertSquad = z.infer<typeof insertSquadSchema>;
export type Squad = typeof squadsTable.$inferSelect;

export const insertSquadPlayerSchema = createInsertSchema(squadPlayersTable).omit({ id: true });
export type InsertSquadPlayer = z.infer<typeof insertSquadPlayerSchema>;
export type SquadPlayer = typeof squadPlayersTable.$inferSelect;
