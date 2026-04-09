import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { CustomerController } from '../controllers/customer.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { CreateCustomerSchema } from '../validators/customer.validator.js'

const router = Router()
const authController = new AuthController()
const customerController = new CustomerController()

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: Aa@123456
 *     responses:
 *       200:
 *         description: login successfully
 *       400:
 *         description: Request body is empty / Username and password are required / Invalid username or password / Staff is inactive
 */
router.post('/login', authController.login.bind(authController))

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout authenticated user
 *     description: Logs out the currently authenticated user. Requires a valid Bearer token.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: logout successfully
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 */
router.post('/logout', authenticate, authController.logout.bind(authController))

// /**
//  * @openapi
//  * /api/auth/register:
//  *   post:
//  *     summary: Register a new customer account
//  *     tags:
//  *       - Auth
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - username
//  *               - first_name
//  *               - last_name
//  *               - email
//  *               - password
//  *             properties:
//  *               username:
//  *                 type: string
//  *                 example: user1
//  *               first_name:
//  *                 type: string
//  *                 example: Tran
//  *               last_name:
//  *                 type: string
//  *                 example: Tai
//  *               email:
//  *                 type: string
//  *                 format: email
//  *                 example: user1@example.com
//  *               password:
//  *                 type: string
//  *                 example: Aa@123456
//  *     responses:
//  *       201:
//  *         description: Register successfully
//  *       400:
//  *         description: Customer with email/username already exists
//  *       422:
//  *         description: Validation failed
//  */
// router.post('/register', validate(CreateCustomerSchema), customerController.register.bind(customerController))

export default router
