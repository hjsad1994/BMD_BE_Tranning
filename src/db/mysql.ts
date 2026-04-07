import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: "8889",
  user: "root",
  password: "root",
  database: "tranning_db",
});

connection.connect((err: Error | null) => {
  if (err) {
    throw err;
  }

  console.log("Connected to MySQL");
});

export default connection;
