import { relations } from "drizzle-orm";
import { users, orders, orderPhotos, messages, supportMessages, savedAddresses } from "./schema.js";

export const usersRelations = relations(users, ({ many }) => ({
  customerOrders: many(orders, { relationName: "customerOrders" }),
  workerOrders: many(orders, { relationName: "workerOrders" }),
  messages: many(messages),
  supportMessages: many(supportMessages),
  savedAddresses: many(savedAddresses),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "customerOrders",
  }),
  worker: one(users, {
    fields: [orders.workerId],
    references: [users.id],
    relationName: "workerOrders",
  }),
  photos: many(orderPhotos),
  messages: many(messages),
}));

export const orderPhotosRelations = relations(orderPhotos, ({ one }) => ({
  order: one(orders, {
    fields: [orderPhotos.orderId],
    references: [orders.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  order: one(orders, {
    fields: [messages.orderId],
    references: [orders.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  sender: one(users, {
    fields: [supportMessages.senderId],
    references: [users.id],
  }),
}));

export const savedAddressesRelations = relations(savedAddresses, ({ one }) => ({
  user: one(users, {
    fields: [savedAddresses.userId],
    references: [users.id],
  }),
}));