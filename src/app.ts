import express from "express";
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import initDatabase from "./db/dbinit.js";
import staffRoutes from './routes/staff.routes.js'
import authRoutes from './routes/auth.routes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

// init database
initDatabase();

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BMD Training API",
      version: "1.0.0",
      description: "API documentation for BMD Training backend",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [],
  },
  apis: [join(__dirname, "./routes/**/*.js"), join(__dirname, "./routes/**/*.ts")],
});

app.get('/', (_req, res) => {
  res.json({ message: "App is running" });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.use('/api/admin', staffRoutes)
app.use('/api/auth', authRoutes)

export default app;
