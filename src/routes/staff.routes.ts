import { Router } from 'express'
import { StaffController } from '../controllers/staff.controller.js'
import { initStaffGuard } from '../middleware/staff.middleware.js'
const router = Router()
const staffController = new StaffController()

router.post('/init-staff', initStaffGuard ,staffController.initStaff)
export default router;