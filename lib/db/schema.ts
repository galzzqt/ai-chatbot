import { pgTable, uuid, text, timestamp, bigint, numeric, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversations.id),
  role: text("role"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productsCache = pgTable("products_cache", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: text("name"),
  slug: text("slug"),
  category: text("category"),
  brand: text("brand"),
  price: numeric("price"),
  stock: integer("stock"),
  specs: jsonb("specs"),
  shortDescription: text("short_description"),
  updatedAt: timestamp("updated_at"),
});
