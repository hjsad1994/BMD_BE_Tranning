import { Router } from 'express'
import { ProductController } from '../controllers/product.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { CreateProductSchema, UpdateProductSchema } from '../validators/product.validator.js'

const router = Router()
const productController = new ProductController()

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     summary: Get all products
 *     description: Returns a list of all products. Requires staff authentication.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get products successfully
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
 *                   example: Get products successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       category_id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: iPhone 20
 *                       description:
 *                         type: string
 *                         example: Apple 
 *                       price:
 *                         type: number
 *                         example: 999.99
 *                       stock:
 *                         type: integer
 *                         example: 50
 *                       image_url:
 *                         type: string
 *                         example: https://example.com/1.png
 *                       status:
 *                         type: string
 *                         example: active
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, requireStaff, productController.getAllProducts.bind(productController))

/**
 * @openapi
 * /api/admin/products/category/{id}:
 *   get:
 *     summary: Get products by category
 *     description: Returns all products belonging to a specific category.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID to filter products by
 *         example: 1
 *     responses:
 *       200:
 *         description: Get products by category successfully
 *       400:
 *         description: Invalid category id / Category not found
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 */
router.get('/category/:id', authenticate, requireStaff, productController.getProductsByCategory.bind(productController))

/**
 * @openapi
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Returns details of a single product by its ID.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Get product successfully
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
 *                   example: Get product successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     category_id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: iPhone 15
 *                     price:
 *                       type: number
 *                       example: 999.99
 *                     stock:
 *                       type: integer
 *                       example: 50
 *                     status:
 *                       type: string
 *                       example: active
 *       400:
 *         description: Invalid product id
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Product not found
 */
router.get('/:id', authenticate, requireStaff, productController.getProductById.bind(productController))

/**
 * @openapi
 * /api/admin/products:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product. Requires staff authentication.
 *     tags:
 *       - Products
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
 *               - price
 *               - stock
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: iPhone 15
 *               description:
 *                 type: string
 *                 example: test test test 
 *               price:
 *                 type: number
 *                 example: 999.99
 *               stock:
 *                 type: integer
 *                 example: 50
 *               image_url:
 *                 type: string
 *                 example: https://example.com/iphone.png
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Category not found / Product name is required
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.post('/', authenticate, requireStaff, validate(CreateProductSchema), productController.createProduct.bind(productController))

/**
 * @openapi
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates an existing product by its ID. Requires staff authentication.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: iPhone 
 *               description:
 *                 type: string
 *                 example: updated test test etst
 *               price:
 *                 type: number
 *                 example: 1199.99
 *               stock:
 *                 type: integer
 *                 example: 30
 *               image_url:
 *                 type: string
 *                 example: https://example.com/1.png
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid product id / Request body is empty / No data to update / Category not found
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       422:
 *         description: Validation failed
 */
router.put('/:id', authenticate, requireStaff, validate(UpdateProductSchema), productController.updateProduct.bind(productController))

/**
 * @openapi
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Soft-deletes a product by its ID. The record is not permanently removed. Requires staff authentication.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product id / Product not found
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 */
router.delete('/:id', authenticate, requireStaff, productController.deleteProduct.bind(productController))

/**
 * @openapi
 * /api/admin/products/{id}/restore:
 *   patch:
 *     summary: Restore a deleted product
 *     description: Restores a soft-deleted product by its ID. Requires staff authentication.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID to restore
 *         example: 1
 *     responses:
 *       200:
 *         description: Product restored successfully
 *       400:
 *         description: Invalid product id
 *       401:
 *         description: Unauthorized / Token missing / Invalid or expired token
 *       403:
 *         description: Account is inactive / Forbidden staff only
 *       404:
 *         description: Product not found or not deleted
 */
router.patch('/:id/restore', authenticate, requireStaff, productController.restoreProduct.bind(productController))

export default router
