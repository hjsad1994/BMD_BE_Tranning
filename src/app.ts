import express from "express";
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from "swagger-jsdoc";

import initDatabase from "./db/dbinit.js";
import staffRoutes from './routes/staff.routes.js'
import authRoutes from './routes/auth.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import customerRoutes from './routes/customer.routes.js'

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
    servers: [
      { url: "http://192.168.1.4:3000", description: "Production" },
      { url: "http://localhost:3000", description: "Local" },
      // { url: "http://172.29.20.96:3000", description: "local public"}
    ],
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
  apis: ["src/routes/**/*.ts"],
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
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', productRoutes)
app.use('/api/admin/customers', customerRoutes)
app.use('/api/auth', authRoutes)

export default app;
