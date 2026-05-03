import { mysqlTable, varchar, text, timestamp, int, boolean, json, mysqlEnum, decimal, bigint } from "drizzle-orm/mysql-core";

// Users table (extends auth system)
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  authType: mysqlEnum("authType", ["kimi", "local"]).default("kimi").notNull(),
  role: mysqlEnum("role", ["user", "customer", "worker", "admin"]).default("customer").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("5.0"),
  totalRatings: int("totalRatings").default(0),
  isOnline: boolean("isOnline").default(false),
  suspended: boolean("suspended").default(false),
  workSchedule: json("workSchedule"),
  referralCode: varchar("referralCode", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// Orders table
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).notNull(),
  workerId: bigint("workerId", { mode: "number", unsigned: true }),
  serviceType: mysqlEnum("serviceType", ["delivery", "shopping", "cleaning", "moving"]).notNull(),
  status: mysqlEnum("status", [
    "searching_worker",
    "worker_found",
    "on_the_way",
    "arrived",
    "in_progress",
    "completed",
    "cancelled",
  ]).default("searching_worker").notNull(),
  pickupAddress: text("pickupAddress").notNull(),
  pickupLat: decimal("pickupLat", { precision: 10, scale: 7 }).notNull(),
  pickupLng: decimal("pickupLng", { precision: 10, scale: 7 }).notNull(),
  destinationAddress: text("destinationAddress").notNull(),
  destinationLat: decimal("destinationLat", { precision: 10, scale: 7 }).notNull(),
  destinationLng: decimal("destinationLng", { precision: 10, scale: 7 }).notNull(),
  stops: json("stops"),
  notes: text("notes"),
  distance: decimal("distance", { precision: 5, scale: 1 }).default("0.0"),
  price: int("price").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cod", "card", "wallet"]).default("cod"),
  paymentStatus: mysqlEnum("paymentStatus", ["paid", "unpaid"]).default("unpaid"),
  promoCode: varchar("promoCode", { length: 50 }),
  discountAmount: int("discountAmount").default(0),
  isScheduled: boolean("isScheduled").default(false),
  scheduledAt: timestamp("scheduledAt"),
  workerLocation: json("workerLocation"),
  cancelledBy: varchar("cancelledBy", { length: 20 }),
  cancelReason: text("cancelReason"),
  customerRating: int("customerRating"),
  customerReview: text("customerReview"),
  workerRating: int("workerRating"),
  workerReview: text("workerReview"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Order photos (evidence)
export const orderPhotos = mysqlTable("orderPhotos", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 36 }).notNull(),
  type: mysqlEnum("type", ["before", "after"]).notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Chat messages
export const messages = mysqlTable("messages", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 36 }).notNull(),
  senderId: bigint("senderId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Support chat (admin support)
export const supportMessages = mysqlTable("supportMessages", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  senderId: bigint("senderId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Saved addresses
export const savedAddresses = mysqlTable("savedAddresses", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  type: mysqlEnum("type", ["home", "work", "other"]).default("home"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderPhoto = typeof orderPhotos.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type SavedAddress = typeof savedAddresses.$inferSelect;
