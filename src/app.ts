import express from "express";
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import path from "path";
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

import initDatabase from "./db/dbinit.js";
import staffRoutes from './routes/staff.routes.js'
import authRoutes from './routes/auth.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import customerRoutes from './routes/customer.routes.js'
import orderRoutes from './routes/order.routes.js'

const app = express();

app.use(cors())
app.use(express.json());

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// init database
initDatabase();

// Load tsoa-generated swagger spec and patch servers 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const swaggerDocument = JSON.parse(
  readFileSync(path.join(__dirname, '../build/swagger.json'), 'utf-8')
) as Record<string, unknown>
swaggerDocument['servers'] = [
  { url: 'http://localhost:3000', description: 'Local' },
]

app.get('/', (_req, res) => {
  res.json({ message: "App is running" });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.use('/api/admin/staff', staffRoutes)
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', productRoutes)
app.use('/api/admin/customers', customerRoutes)
app.use('/api/admin/orders', orderRoutes)
app.use('/api/auth', authRoutes)

export default app;
