import express from "express";
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from "swagger-jsdoc";

import initDatabase from "./db/dbinit.js";
import staffRoutes from './routes/staff.routes.js'
const app = express();

app.use(express.json());
// init database
initDatabase();

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BMD Tranning API",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/**/*.ts"],
});

app.get('/', (_req, res) => {
  res.json({ message: "App is running" });
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/admin', staffRoutes)

export default app;