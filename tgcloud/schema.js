import { table, integer, text, sql } from "sdk/db";

/**
 * Temporary session storage for multi-step extraction flow.
 * Stores the firmware URL while the user picks a target file.
 */
export const sessions = table("sessions", {
  userId: integer("user_id").primaryKey(),
  url: text("url").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
