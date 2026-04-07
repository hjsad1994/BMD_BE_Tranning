import express from "express";
import initDatabase from "./db/dbinit.js";
import staffRoutes from './routes/staff.routes.js'
const app = express();

app.use(express.json());
initDatabase();

app.get("/", (_req, res) => {
  res.json({ message: "App is running" });
});

app.use('/api/admin', staffRoutes)

export default app;