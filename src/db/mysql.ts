import mysql from "mysql2";
import type { Pool } from "mysql2";

const pool: Pool = mysql.createPool({
  host: "127.0.0.1",
  port: 8889,
  user: "root",
  password: "root",
  database: "tranning_db",
});

pool.getConnection((err, connection) => {
  if (err) {
    throw err;
  }

  console.log("Connected to MySQL");
  connection.release();
});

export default pool;
