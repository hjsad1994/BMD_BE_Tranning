import express from "express";
import initDatabase from "./db/dbinit.js";

const app = express();

app.use(express.json());
initDatabase();

app.get("/", (_req, res) => {
  res.json({ message: "App is running" });
});

export default app;