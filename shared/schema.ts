import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  // Birth data (private — never shown publicly)
  birthName: text("birth_name"),
  birthdate: text("birthdate"), // ISO date string YYYY-MM-DD
  characterName: text("character_name"), // public-facing player name
  currentLocation: text("current_location"), // city, country
  // Astrology (computed on backend, never surfaced to user yet)
  sunSign: text("sun_sign"),
  earthChartData: text("earth_chart_data"), // JSON
  jcuChartData: text("jcu_chart_data"), // JSON
  jcuBirthTimestamp: integer("jcu_birth_timestamp"), // exact ms of account completion
  // JCU state
  archetype: text("archetype"),
  contentCategory: text("content_category"), // comedies | histories | mysteries
  userState: text("user_state").notNull().default("solid"),
  gameActive: integer("game_active", { mode: "boolean" }).notNull().default(false),
  onboardingComplete: integer("onboarding_complete", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sessions
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export type Session = typeof sessions.$inferSelect;

// Content items
export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // comedies | histories | mysteries | archives
  medium: text("medium").notNull(), // film | book | audio | music | pdf
  characters: text("characters").notNull().default("[]"),
  state: text("state").notNull().default("liquid"),
  act: text("act").notNull().default("one"),
  accessLevel: text("access_level").notNull().default("player"),
  tags: text("tags").notNull().default("[]"),
  connectedChallenges: text("connected_challenges").notNull().default("[]"),
  duration: text("duration"),
  description: text("description"),
  releaseDate: integer("release_date"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  // Storefront fields
  price: real("price"), // null = free
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  isForSale: integer("is_for_sale", { mode: "boolean" }).notNull().default(false),
  contentUrl: text("content_url"), // URL to actual content (PDF, audio, etc.)
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const insertContentSchema = createInsertSchema(contentItems).omit({ id: true, createdAt: true });
export type InsertContent = z.infer<typeof insertContentSchema>;
export type ContentItem = typeof contentItems.$inferSelect;

// Orders — tracks purchases
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  contentItemId: integer("content_item_id").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSessionId: text("stripe_session_id"),
  amount: real("amount").notNull(), // in dollars
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull().default("pending"), // pending | paid | failed
  deliveryStatus: text("delivery_status").notNull().default("pending"), // pending | delivered
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// User unlocks — content a user has paid for / unlocked
export const userUnlocks = sqliteTable("user_unlocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  contentItemId: integer("content_item_id").notNull(),
  orderId: integer("order_id"),
  unlockedAt: integer("unlocked_at").notNull().$defaultFn(() => Date.now()),
});

export type UserUnlock = typeof userUnlocks.$inferSelect;
