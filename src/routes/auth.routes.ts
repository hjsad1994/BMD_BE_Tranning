import { Router } from 'express'
import { AuthController } from '../tsoa-controllers/AuthController.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()
const authController = new AuthController()

// Staff login
router.post('/login', authController.loginHandler.bind(authController))
router.post('/logout', authenticate, authController.logoutHandler.bind(authController))

// Customer login
router.post('/client/login', authController.loginCustomerHandler.bind(authController))

export default router
