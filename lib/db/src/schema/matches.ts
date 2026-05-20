import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const matchPredictionsTable = pgTable("match_predictions", {
  id: serial("id").primaryKey(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  confidence: real("confidence").notNull(),
  aiAnalysis: text("ai_analysis").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchPredictionSchema = createInsertSchema(matchPredictionsTable).omit({ id: true, createdAt: true });
export type InsertMatchPrediction = z.infer<typeof insertMatchPredictionSchema>;
export type MatchPrediction = typeof matchPredictionsTable.$inferSelect;
