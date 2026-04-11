import { Router } from 'express'
import { ClientAdminController } from '../tsoa-controllers/ClientAdminController.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
    CreateCustomerSchema,
    UpdateCustomerSchema,
    UpdateCustomerStatusSchema,
    AdminResetPasswordSchema,
} from '../validators/client-admin.validator.js'

const router = Router()
const clientAdminController = new ClientAdminController()

// ── Admin routes (/api/admin/customers) ──────────────────────────────────────
router.get('/', authenticate, requireStaff, clientAdminController.getAllCustomersHandler.bind(clientAdminController))
router.post('/', authenticate, requireStaff, validate(CreateCustomerSchema), clientAdminController.createCustomerHandler.bind(clientAdminController))
router.get('/:customerId', authenticate, requireStaff, clientAdminController.getCustomerByIdHandler.bind(clientAdminController))
router.put('/', authenticate, requireStaff, validate(UpdateCustomerSchema), clientAdminController.updateCustomerHandler.bind(clientAdminController))
router.put('/status', authenticate, requireStaff, validate(UpdateCustomerStatusSchema), clientAdminController.updateStatusHandler.bind(clientAdminController))
router.delete('/', authenticate, requireStaff, clientAdminController.deleteCustomerHandler.bind(clientAdminController))
router.put('/restore', authenticate, requireStaff, clientAdminController.restoreCustomerHandler.bind(clientAdminController))
router.put('/reset-password', authenticate, requireStaff, validate(AdminResetPasswordSchema), clientAdminController.resetPasswordHandler.bind(clientAdminController))

export default router
