import { Router } from 'express'
import { StaffController } from '../controllers/staff.controller.js'
import { initStaffGuard, requireStaff } from '../middleware/staff.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
    InitStaffSchema,
    UpdateProfileSchema,
    ChangePasswordSchema,
    ResetPasswordSchema,
    UpdateStatusSchema,
} from '../validators/staff.validator.js'

const router = Router()
const staffController = new StaffController()

/**
 * @openapi
 * /api/admin/staff/init-staff:
 *   post:
 *     summary: Initialize the first staff account
 *     description: Creates the initial system staff account if no staff exists yet.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: header
 *         name: x-init-secret
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
 *               - username
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
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
 *         description: Init admin account suscessfully
 *       400:
 *         description: Missing required fields or Admin account already initialized
 *       403:
 *         description: Init staff is disable / Forbidden
 *       422:
 *         description: Validation failed
 */
router.post('/init-staff', initStaffGuard, validate(InitStaffSchema), staffController.initStaff.bind(staffController))

/**
 * @openapi
 * /api/admin/staff/profile:
 *   get:
 *     summary: Get authenticated staff profile
 *     description: Returns the profile of the currently authenticated staff member.
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get profile successfully
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       500:
 *         description: Staff not found / Server error
 */
router.get('/profile', authenticate, requireStaff, staffController.getProfile.bind(staffController))

/**
 * @openapi
 * /api/admin/staff/profile:
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
 *         description: Profile update successfully
 *       400:
 *         description: Request body is empty / Staff not found / No data to update / Email already in use by another staff member
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.put('/profile', authenticate, requireStaff, validate(UpdateProfileSchema), staffController.updateProfile.bind(staffController))

/**
 * @openapi
 * /api/admin/staff:
 *   get:
 *     summary: Get all staff profiles
 *     description: Returns a list of all staff member profiles.
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get admin list successfully
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       500:
 *         description: server error
 */
router.get('/', authenticate, requireStaff, staffController.getAllStaffProfile.bind(staffController))

/**
 * @openapi
 * /api/admin/staff/{id}:
 *   get:
 *     summary: Get a staff member by ID
 *     description: Returns the profile of a specific staff member by their ID.
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the staff member
 *         example: 1
 *     responses:
 *       200:
 *         description: Get staff successfully
 *       400:
 *         description: Invalid staff id
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Staff not found
 */
router.get('/:id', authenticate, requireStaff, staffController.getStaffById.bind(staffController))

/**
 * @openapi
 * /api/admin/staff/profile/change-password:
 *   put:
 *     summary: Change password for authenticated staff
 *     description: Allows the currently authenticated staff member to change their own password.
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
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: Aa@123456
 *               newPassword:
 *                 type: string
 *                 example: Aa@1234567
 *     responses:
 *       200:
 *         description: Password change successfully
 *       400:
 *         description: old password and new password are required / staff not found / Old password is incorrect
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.put('/profile/change-password', authenticate, requireStaff, validate(ChangePasswordSchema), staffController.changePassword.bind(staffController))

/**
 * @openapi
 * /api/admin/staff/{id}/reset-password:
 *   put:
 *     summary: Reset password for a staff member by ID
 *     description: Allows an authenticated staff member to reset the password of another staff member.
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the staff member whose password will be reset
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: Aa@123456
 *     responses:
 *       200:
 *         description: Reset password successfully
 *       400:
 *         description: Invalid staff id / new password are required / Staff not found
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.put('/:id/reset-password', authenticate, requireStaff, validate(ResetPasswordSchema), staffController.resetPassword.bind(staffController))

/**
 * @openapi
 * /api/admin/staff/{id}/status:
 *   patch:
 *     summary: Update status of a staff member by ID
 *     description: Allows an authenticated staff member to activate or deactivate another staff member.
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the staff member whose status will be updated
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: inactive
 *     responses:
 *       200:
 *         description: Update status successfully
 *       400:
 *         description: Invalid staff id / Status is required / Invalid status value / staff not found
 *       401:
 *         description: unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.patch('/:id/status', authenticate, requireStaff, validate(UpdateStatusSchema), staffController.updateStatus.bind(staffController))

export default router;
