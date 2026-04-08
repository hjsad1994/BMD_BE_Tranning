import { Router } from 'express'
import { StaffController } from '../controllers/staff.controller.js'
import { initStaffGuard } from '../middleware/staff.middleware.js'
const router = Router()
const staffController = new StaffController()

/**
 * @openapi
 * /api/admin/init-staff:
 *   post:
 *     summary: Initialize the first staff account
 *     description: >
 *       Creates the initial system staff account.
 *       Requires the `ALLOW_INIT_STAFF` environment flag to be enabled and a valid `x-init-secret` header.
 *       Fails if a staff account already exists.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: header
 *         name: x-init-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Secret used to authorize the creation of the first staff account (must match INIT_STAFF_SECRET env variable)
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
 *         description: Staff account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Init admin account suscessfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     staffId:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: admin
 *                     email:
 *                       type: string
 *                       example: admin@example.com
 *       400:
 *         description: Missing required fields or a staff account already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin account already init
 *       403:
 *         description: Init staff feature is disabled or invalid secret header
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 */
router.post('/init-staff', initStaffGuard, staffController.initStaff)
export default router;