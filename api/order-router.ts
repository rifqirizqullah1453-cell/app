import { getDb } from "./queries/connection.js";
import { orders, orderPhotos, messages } from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware.js";
import type { TrpcContext } from "./context.js";

export async function createOrder(data: {
  customerId: number;
  serviceType: "delivery" | "shopping" | "cleaning" | "moving";
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  stops?: Array<{ address: string; lat: number; lng: number }>;
  notes?: string;
  price: number;
  distance?: number;
  isScheduled?: boolean;
  scheduledAt?: Date;
}) {
  const db = getDb();
  const orderId = `ORD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(orders).values({
    id: orderId,
    customerId: data.customerId,
    serviceType: data.serviceType,
    pickupAddress: data.pickupAddress,
    pickupLat: String(data.pickupLat),
    pickupLng: String(data.pickupLng),
    destinationAddress: data.destinationAddress,
    destinationLat: String(data.destinationLat),
    destinationLng: String(data.destinationLng),
    stops: data.stops ? JSON.stringify(data.stops) : null,
    notes: data.notes || null,
    price: data.price,
    distance: data.distance ? String(data.distance) : null,
    isScheduled: data.isScheduled || false,
    scheduledAt: data.scheduledAt || null,
    status: "searching_worker",
    paymentStatus: "unpaid",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
  return orderId;
}

export async function findCustomerOrders(customerId: number) {
  const db = getDb();
  return db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    orderBy: [desc(orders.createdAt)],
    with: { photos: true, worker: true },
  });
}

export async function findAvailableOrders() {
  const db = getDb();
  return db.query.orders.findMany({
    where: and(eq(orders.status, "searching_worker")),
    orderBy: [desc(orders.createdAt)],
  });
}

export async function findWorkerOrders(workerId: number) {
  const db = getDb();
  return db.query.orders.findMany({
    where: eq(orders.workerId, workerId),
    orderBy: [desc(orders.createdAt)],
    with: { photos: true, customer: true },
  });
}

export async function findOrderById(orderId: string) {
  const db = getDb();
  return db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { photos: true, worker: true, customer: true },
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: "searching_worker" | "worker_found" | "on_the_way" | "arrived" | "in_progress" | "completed" | "cancelled"
) {
  const db = getDb();
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));
}

export async function assignWorker(orderId: string, workerId: number) {
  const db = getDb();
  await db.update(orders).set({ workerId, status: "worker_found", updatedAt: new Date() }).where(eq(orders.id, orderId));
}

export async function cancelOrder(orderId: string, reason?: string, cancelledBy?: string) {
  const db = getDb();
  await db.update(orders).set({
    status: "cancelled",
    cancelReason: reason || null,
    cancelledBy: cancelledBy || null,
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId));
}

export async function rateOrder(orderId: string, data: {
  customerRating?: number;
  customerReview?: string;
  workerRating?: number;
  workerReview?: string;
}) {
  const db = getDb();
  await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, orderId));
}

export async function markOrderPaid(orderId: string) {
  const db = getDb();
  await db.update(orders).set({ paymentStatus: "paid", paidAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, orderId));
}

export async function updateWorkerLocation(orderId: string, lat: number, lng: number) {
  const db = getDb();
  await db.update(orders).set({
    workerLocation: JSON.stringify({ lat, lng, timestamp: Date.now() }),
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId));
}

export async function findAllOrders() {
  const db = getDb();
  return db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: { customer: true, worker: true },
  });
}

export async function createOrderPhoto(data: { orderId: string; type: "before" | "after"; url: string }) {
  const db = getDb();
  await db.insert(orderPhotos).values({ ...data, createdAt: new Date() });
}

export async function findOrderPhotos(orderId: string) {
  const db = getDb();
  return db.query.orderPhotos.findMany({
    where: eq(orderPhotos.orderId, orderId),
    orderBy: [desc(orderPhotos.createdAt)],
  });
}

export async function createMessage(data: { orderId: string; senderId: number; content: string }) {
  const db = getDb();
  await db.insert(messages).values({ ...data, createdAt: new Date() });
}

export async function findMessagesByOrder(orderId: string) {
  const db = getDb();
  return db.query.messages.findMany({
    where: eq(messages.orderId, orderId),
    orderBy: [desc(messages.createdAt)],
    with: { sender: true },
  });
}

export const orderRouter = createRouter({
  list: publicQuery.query(() => findAllOrders()),
  myOrders: authedQuery.query(({ ctx }: { ctx: TrpcContext }) =>
    ctx.user ? findCustomerOrders(ctx.user.id) : []
  ),
  workerOrders: authedQuery.query(({ ctx }: { ctx: TrpcContext }) =>
    ctx.user ? findWorkerOrders(ctx.user.id) : []
  ),
  available: publicQuery.query(() => findAvailableOrders()),
  byId: publicQuery
    .input(z.object({ id: z.string() }))
    .query(({ input }: { input: { id: string } }) => findOrderById(input.id)),
  create: authedQuery
    .input(z.object({
      serviceType: z.enum(["delivery", "shopping", "cleaning", "moving"]),
      pickupAddress: z.string().min(1),
      pickupLat: z.number(),
      pickupLng: z.number(),
      destinationAddress: z.string().min(1),
      destinationLat: z.number(),
      destinationLng: z.number(),
      stops: z.array(z.object({ address: z.string(), lat: z.number(), lng: z.number() })).optional(),
      notes: z.string().optional(),
      price: z.number().min(0),
      distance: z.number().optional(),
      isScheduled: z.boolean().optional(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(({ ctx, input }: { ctx: TrpcContext; input: any }) =>
      createOrder({
        customerId: ctx.user!.id,
        ...input,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      })
    ),
  accept: authedQuery
    .input(z.object({ orderId: z.string() }))
    .mutation(({ ctx, input }: { ctx: TrpcContext; input: any }) =>
      assignWorker(input.orderId, ctx.user!.id)
    ),
  updateStatus: authedQuery
    .input(z.object({ orderId: z.string(), status: z.string() }))
    .mutation(({ input }: { input: any }) =>
      updateOrderStatus(input.orderId, input.status as any)
    ),
  cancel: authedQuery
    .input(z.object({ orderId: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }: { ctx: TrpcContext; input: any }) =>
      cancelOrder(input.orderId, input.reason, ctx.user!.name || undefined)
    ),
  rate: authedQuery
    .input(z.object({
      orderId: z.string(),
      customerRating: z.number().min(1).max(5).optional(),
      customerReview: z.string().optional(),
      workerRating: z.number().min(1).max(5).optional(),
      workerReview: z.string().optional(),
    }))
    .mutation(({ input }: { input: any }) =>
      rateOrder(input.orderId, {
        customerRating: input.customerRating,
        customerReview: input.customerReview,
        workerRating: input.workerRating,
        workerReview: input.workerReview,
      })
    ),
  markPaid: authedQuery
    .input(z.object({ orderId: z.string() }))
    .mutation(({ input }: { input: any }) => markOrderPaid(input.orderId)),
  updateLocation: authedQuery
    .input(z.object({ orderId: z.string(), lat: z.number(), lng: z.number() }))
    .mutation(({ input }: { input: any }) =>
      updateWorkerLocation(input.orderId, input.lat, input.lng)
    ),
  photos: publicQuery
    .input(z.object({ orderId: z.string() }))
    .query(({ input }: { input: any }) => findOrderPhotos(input.orderId)),
  addPhoto: authedQuery
    .input(z.object({
      orderId: z.string(),
      type: z.enum(["before", "after"]),
      url: z.string(),
    }))
    .mutation(({ input }: { input: any }) => createOrderPhoto(input)),
  messages: publicQuery
    .input(z.object({ orderId: z.string() }))
    .query(({ input }: { input: any }) => findMessagesByOrder(input.orderId)),
  sendMessage: authedQuery
    .input(z.object({
      orderId: z.string(),
      content: z.string().min(1),
    }))
    .mutation(({ ctx, input }: { ctx: TrpcContext; input: any }) =>
      createMessage({ orderId: input.orderId, senderId: ctx.user!.id, content: input.content })
    ),
});