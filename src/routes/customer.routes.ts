import { Router } from 'express'
import { CustomerController } from '../controllers/customer.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { CreateCustomerSchema, UpdateCustomerSchema, UpdateCustomerStatusSchema } from '../validators/customer.validator.js'

const router = Router()
const customerController = new CustomerController()

/**
 * @openapi
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     description: Returns a list of all customers. Requires staff authentication.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get customers successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Get customers successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: user1
 *                       first_name:
 *                         type: string
 *                         example: Tran
 *                       last_name:
 *                         type: string
 *                         example: Tai
 *                       email:
 *                         type: string
 *                         example: user1@example.com
 *                       phone:
 *                         type: string
 *                         example: "0778946513"
 *                       status:
 *                         type: string
 *                         example: active
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, requireStaff, customerController.getAllCustomers.bind(customerController))

/**
 * @openapi
 * /api/admin/customers:
 *   post:
 *     summary: Create a new customer account 
 *     description: Creates a new customer account. Requires staff authentication.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: user1
 *               first_name:
 *                 type: string
 *                 example: Tran
 *               last_name:
 *                 type: string
 *                 example: Tai
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user1@example.com
 *               password:
 *                 type: string
 *                 example: Aa@123456
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Customer with email/username already exists
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.post('/', authenticate, requireStaff, validate(CreateCustomerSchema), customerController.createCustomer.bind(customerController))

/**
 * @openapi
 * /api/admin/customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     description: Returns details of a single customer by their ID.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The customer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Get customer successfully
 *       400:
 *         description: Invalid customer id
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Customer not found
 */
router.get('/:id', authenticate, requireStaff, customerController.getCustomerById.bind(customerController))

/**
 * @openapi
 * /api/admin/customers/{id}:
 *   put:
 *     summary: Update a customer
 *     description: Updates an existing customer's profile by their ID. Requires staff authentication.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The customer ID to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Tran
 *               last_name:
 *                 type: string
 *                 example: Tai
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user1@example.com
 *               phone:
 *                 type: string
 *                 example: "0778946513"
 *               address:
 *                 type: string
 *                 example: "51 Duong A, TPHCM"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.png"
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Invalid customer id / Request body is empty / No data to update / Email already in use
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.put('/:id', authenticate, requireStaff, validate(UpdateCustomerSchema), customerController.updateCustomer.bind(customerController))

/**
 * @openapi
 * /api/admin/customers/{id}/status:
 *   patch:
 *     summary: Update customer status
 *     description: Activates or deactivates a customer account by their ID.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The customer ID
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
 *         description: Customer status updated successfully
 *       400:
 *         description: Invalid customer id / Customer not found
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.patch('/:id/status', authenticate, requireStaff, validate(UpdateCustomerStatusSchema), customerController.updateStatus.bind(customerController))

/**
 * @openapi
 * /api/admin/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     description: Soft-deletes a customer by their ID. The record is not permanently removed.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The customer ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       400:
 *         description: Invalid customer id
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Customer not found
 */
router.delete('/:id', authenticate, requireStaff, customerController.deleteCustomer.bind(customerController))

/**
 * @openapi
 * /api/admin/customers/{id}/restore:
 *   patch:
 *     summary: Restore a deleted customer
 *     description: Restores a soft-deleted customer by their ID.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The customer ID to restore
 *         example: 1
 *     responses:
 *       200:
 *         description: Customer restored successfully
 *       400:
 *         description: Invalid customer id
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Customer not found or not deleted
 */
router.patch('/:id/restore', authenticate, requireStaff, customerController.restoreCustomer.bind(customerController))

export default router
