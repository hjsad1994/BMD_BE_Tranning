import { Router } from 'express'
import { StaffController } from '../controllers/staff.controller.js'
import { initStaffGuard, requireStaff } from '../middleware/staff.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
const router = Router()
const staffController = new StaffController()

/**
 * @openapi
 * /api/admin/init-staff:
 *   post:
 *     summary: Initialize the first staff account
 *     description: Creates the initial system staff account if no staff exists yet.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: header
 *         name: x-init-staff-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Secret used to authorize the creation of the first staff account
 *         example: test123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Tai
 *               last_name:
 *                 type: string
 *                 example: Tran
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Aa@123456
 *     responses:
 *       201:
 *         description: Staff account created successfully
 *       400:
 *         description: Invalid data or staff account already exists
 *       403:
 *         description: Init staff is disabled
 *       500:
 *         description: Internal server error
 */
router.post('/init-staff', initStaffGuard, staffController.initStaff.bind(staffController))

/**
 * @openapi
 * /api/admin/profile:
 *   put:
 *     summary: Update authenticated staff profile
 *     description: Updates the profile of the currently authenticated staff member.
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Tai
 *               last_name:
 *                 type: string
 *                 example: Tran
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               phone:
 *                 type: string
 *                 example: "0778946513"
 *               address:
 *                 type: string
 *                 example: "51 Duong A , TPHCM"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.png"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Request body is empty
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticate, requireStaff, staffController.getProfile.bind(staffController))
router.put('/profile', authenticate, requireStaff, staffController.updateProfile.bind(staffController))
// router.get('/id', authenticate , requireStaff, staffController.getStaff)
router.get('/', authenticate, requireStaff, staffController.getAllStaffProfile.bind(staffController))
router.put('/profile/change-password', authenticate, requireStaff, staffController.changePassword.bind(staffController))
router.put('/:id/reset-password', authenticate, requireStaff, staffController.resetPassword.bind(staffController))
router.patch('/:id/status', authenticate, requireStaff, staffController.updateStatus.bind(staffController))

export default router;