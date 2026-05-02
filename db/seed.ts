import { getDb } from "../api/queries/connection";
import { users, orders, messages, orderPhotos } from "./schema";

async function seed() {
  const db = getDb();

  // Clear existing data
  await db.delete(orderPhotos);
  await db.delete(messages);
  await db.delete(orders);
  await db.delete(users);

  console.log("Seeding users...");

  // Insert demo users
  const [customer] = await db.insert(users).values({
    unionId: "demo-customer-001",
    name: "Budi Santoso",
    email: "customer@demo.com",
    phone: "0532 123 4567",
    role: "customer",
    rating: "5.0",
    totalRatings: 0,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignInAt: new Date(),
  }).$returningId();

  const [worker] = await db.insert(users).values({
    unionId: "demo-worker-001",
    name: "Ahmad Yilmaz",
    email: "worker@demo.com",
    phone: "0532 987 6543",
    role: "worker",
    rating: "4.8",
    totalRatings: 12,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignInAt: new Date(),
  }).$returningId();

  const [admin] = await db.insert(users).values({
    unionId: "demo-admin-001",
    name: "Admin BOH",
    email: "admin@demo.com",
    phone: "0532 111 2222",
    role: "admin",
    rating: "5.0",
    totalRatings: 0,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignInAt: new Date(),
  }).$returningId();

  console.log("Seeding orders...");

  // Insert demo orders
  await db.insert(orders).values({
    id: "ORD-001",
    customerId: customer.id,
    serviceType: "delivery",
    status: "completed",
    pickupAddress: "Amasra, Bartin",
    pickupLat: "41.7461",
    pickupLng: "32.3865",
    destinationAddress: "Bartin Merkez",
    destinationLat: "41.6358",
    destinationLng: "32.3375",
    price: 150,
    distance: "12.5",
    paymentMethod: "cod",
    paymentStatus: "paid",
    customerRating: 5,
    customerReview: "Great service!",
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  });

  await db.insert(orders).values({
    id: "ORD-002",
    customerId: customer.id,
    workerId: worker.id,
    serviceType: "shopping",
    status: "in_progress",
    pickupAddress: "Bartin Market",
    pickupLat: "41.6360",
    pickupLng: "32.3380",
    destinationAddress: "Kozcağız, Bartin",
    destinationLat: "41.5500",
    destinationLng: "32.3000",
    price: 200,
    distance: "8.2",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  });

  await db.insert(orders).values({
    id: "ORD-003",
    customerId: customer.id,
    serviceType: "moving",
    status: "searching_worker",
    pickupAddress: "Kurucaşile, Bartin",
    pickupLat: "41.8400",
    pickupLng: "32.4100",
    destinationAddress: "Bartin Merkez",
    destinationLat: "41.6358",
    destinationLng: "32.3375",
    price: 450,
    distance: "25.0",
    paymentMethod: "card",
    paymentStatus: "unpaid",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeding complete!");
}

seed().catch(console.error);
