import { Router } from 'express'
import { AuthController } from '../tsoa-controllers/AuthController.js'
import { CustomerController } from '../tsoa-controllers/CustomerController.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { CreateCustomerSchema } from '../validators/customer.validator.js'

const router = Router()
const authController = new AuthController()
const customerController = new CustomerController()

router.post('/login', authController.loginHandler.bind(authController))
router.post('/logout', authenticate, authController.logoutHandler.bind(authController))

// router.post('/register', validate(CreateCustomerSchema), customerController.registerHandler.bind(customerController))

export default router
