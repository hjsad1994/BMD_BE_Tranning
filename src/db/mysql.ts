import "dotenv/config";
import mysql from "mysql2";
import type { Pool } from "mysql2";

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "tranning_db",
});

pool.getConnection((err, connection) => {
  if (err) {
    throw err;
  }

  console.log("Connected to MySQL");
  connection.release();
});

export default pool;
