const mysql = require('mysql2/promise');

async function dropTables() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('DROP TABLE IF EXISTS messages');
  await connection.execute('DROP TABLE IF EXISTS orderPhotos');
  await connection.execute('DROP TABLE IF EXISTS orders');
  await connection.execute('DROP TABLE IF EXISTS savedAddresses');
  await connection.execute('DROP TABLE IF EXISTS supportMessages');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Tables dropped');
  await connection.end();
}

dropTables().catch(console.error);
