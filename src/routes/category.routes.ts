import { Router } from 'express'
import { CategoryController } from '../controllers/category.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { CreateCategorySchema, UpdateCategorySchema } from '../validators/category.validator.js'

const router = Router()
const categoryController = new CategoryController()

/**
 * @openapi
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories
 *     description: Returns a list of all product categories. Requires staff authentication.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get categories successfully
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, requireStaff, categoryController.getAllCategories.bind(categoryController))

/**
 * @openapi
 * /api/admin/categories/detail:
 *   get:
 *     summary: Get a category by ID
 *     description: Returns details of a single category by its ID.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Get category successfully
 *       400:
 *         description: Invalid category id
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Category not found
 */
router.get('/detail', authenticate, requireStaff, categoryController.getCategoryById.bind(categoryController))

/**
 * @openapi
 * /api/admin/categories:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new product category. Requires staff authentication.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Apple
 *               description:
 *                 type: string
 *                 example: Apple test
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Category with this name already exists
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.post('/', authenticate, requireStaff, validate(CreateCategorySchema), categoryController.createCategory.bind(categoryController))

/**
 * @openapi
 * /api/admin/categories:
 *   put:
 *     summary: Update a category
 *     description: Updates an existing category by its ID. Requires staff authentication.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Apple Updated
 *               description:
 *                 type: string
 *                 example: Apple test updated
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid category id / Request body is empty / No data to update / Category name already exists
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.put('/', authenticate, requireStaff, validate(UpdateCategorySchema), categoryController.updateCategory.bind(categoryController))

/**
 * @openapi
 * /api/admin/categories:
 *   delete:
 *     summary: Delete a category
 *     description: Soft-deletes a category by its ID. The record is not permanently removed. Requires staff authentication.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category id / Category not found
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 */
router.delete('/', authenticate, requireStaff, categoryController.deleteCategory.bind(categoryController))

/**
 * @openapi
 * /api/admin/categories/restore:
 *   put:
 *     summary: Restore a deleted category
 *     description: Restores a soft-deleted category by its ID. Requires staff authentication.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID to restore
 *         example: 1
 *     responses:
 *       200:
 *         description: Category restored successfully
 *       400:
 *         description: Invalid category id
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Category not found or not deleted
 */
router.put('/restore', authenticate, requireStaff, categoryController.restoreCategory.bind(categoryController))

export default router
