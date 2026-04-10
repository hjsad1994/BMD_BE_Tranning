import { Router } from 'express'
import { CustomerController } from '../tsoa-controllers/CustomerController.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { CreateCustomerSchema, UpdateCustomerSchema, UpdateCustomerStatusSchema } from '../validators/customer.validator.js'

const router = Router()
const customerController = new CustomerController()

router.get('/', authenticate, requireStaff, customerController.getAllCustomersHandler.bind(customerController))
router.post('/', authenticate, requireStaff, validate(CreateCustomerSchema), customerController.createCustomerHandler.bind(customerController))
router.get('/detail', authenticate, requireStaff, customerController.getCustomerByIdHandler.bind(customerController))
router.put('/', authenticate, requireStaff, validate(UpdateCustomerSchema), customerController.updateCustomerHandler.bind(customerController))
router.put('/status', authenticate, requireStaff, validate(UpdateCustomerStatusSchema), customerController.updateStatusHandler.bind(customerController))
router.delete('/', authenticate, requireStaff, customerController.deleteCustomerHandler.bind(customerController))
router.put('/restore', authenticate, requireStaff, customerController.restoreCustomerHandler.bind(customerController))

export default router
