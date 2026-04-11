import { Router } from 'express'
import { StaffController } from '../tsoa-controllers/StaffController.js'
import { initStaffGuard, requireStaff } from '../middleware/staff.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
    InitStaffSchema,
    CreateStaffSchema,
    UpdateProfileSchema,
    ChangePasswordSchema,
    ResetPasswordSchema,
    UpdateStatusSchema,
} from '../validators/staff.validator.js'

const router = Router()
const staffController = new StaffController()

router.post('/init-staff', initStaffGuard, validate(InitStaffSchema), staffController.initStaffHandler.bind(staffController))
router.get('/profile', authenticate, requireStaff, staffController.getProfileHandler.bind(staffController))
router.put('/profile', authenticate, requireStaff, validate(UpdateProfileSchema), staffController.updateProfileHandler.bind(staffController))
router.get('/', authenticate, requireStaff, staffController.getAllStaffProfileHandler.bind(staffController))
router.post('/', authenticate, requireStaff, validate(CreateStaffSchema), staffController.createStaffHandler.bind(staffController))
router.get('/:staffId', authenticate, requireStaff, staffController.getStaffByIdHandler.bind(staffController))
router.put('/profile/change-password', authenticate, requireStaff, validate(ChangePasswordSchema), staffController.changePasswordHandler.bind(staffController))
router.put('/reset-password', authenticate, requireStaff, validate(ResetPasswordSchema), staffController.resetPasswordHandler.bind(staffController))
router.put('/status', authenticate, requireStaff, validate(UpdateStatusSchema), staffController.updateStatusHandler.bind(staffController))

export default router
