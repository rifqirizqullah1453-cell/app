import { getDb } from "../api/queries/connection";

async function dropTables() {
  const db = getDb();
  try {
    await db.execute("SET FOREIGN_KEY_CHECKS = 0");
    await db.execute("DROP TABLE IF EXISTS messages");
    await db.execute("DROP TABLE IF EXISTS orderPhotos");
    await db.execute("DROP TABLE IF EXISTS orders");
    await db.execute("DROP TABLE IF EXISTS savedAddresses");
    await db.execute("DROP TABLE IF EXISTS supportMessages");
    await db.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Tables dropped successfully");
  } catch (err) {
    console.error("Error dropping tables:", err);
  }
}

dropTables();
