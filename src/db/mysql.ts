import "dotenv/config";
import mysql from "mysql2";
import type { Pool } from "mysql2";

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "tranning_db",
  typeCast(field, next) {
    if (field.type === "DATETIME" || field.type === "TIMESTAMP" || field.type === "DATE") {
        const val = field.string();
        if (!val) return null;
        return Math.floor(new Date(val).getTime() / 1000); // 10 chữ số Unix seconds
    }
    return next();
},
});

pool.getConnection((err, connection) => {
  if (err) {
    throw err;
  }

  console.log("Connected to MySQL");
  connection.release();
});

export default pool;
