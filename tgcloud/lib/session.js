import { db } from "sdk";
import { eq, sql } from "sdk/db";
import { sessions } from "../schema.js";

export async function saveSession(userId, url) {
  await db
    .insert(sessions)
    .values({ userId, url, updatedAt: sql`(unixepoch())` })
    .onConflictDoUpdate({
      target: sessions.userId,
      set: { url, updatedAt: sql`(unixepoch())` },
    })
    .run();
}

export async function getSession(userId) {
  return db.select().from(sessions).where(eq(sessions.userId, userId)).get();
}

export async function clearSession(userId) {
  await db.delete(sessions).where(eq(sessions.userId, userId)).run();
}
