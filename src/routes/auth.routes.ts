import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
const router = Router()

const authController = new AuthController()

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
 * /api/auth/lougout:
 *   post:
 *     summary: Logout authenticated staff
 *     description: Logs out the currently authenticated staff member. Requires a valid Bearer token.
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
router.post('/lougout', authenticate, authController.logout.bind(authController))

export default router
