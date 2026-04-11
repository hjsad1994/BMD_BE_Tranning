import { Router } from 'express'
import { ProductController } from '../tsoa-controllers/ProductController.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { uploadImage } from '../middleware/upload.middleware.js'
import { CreateProductSchema, UpdateProductSchema } from '../validators/product.validator.js'

const router = Router()
const productController = new ProductController()

router.get('/', authenticate, requireStaff, productController.getAllProductsHandler.bind(productController))
router.get('/category', authenticate, requireStaff, productController.getProductsByCategoryHandler.bind(productController))
router.get('/:productId', authenticate, requireStaff, productController.getProductByIdHandler.bind(productController))
router.post('/', authenticate, requireStaff, validate(CreateProductSchema), productController.createProductHandler.bind(productController))
router.put('/', authenticate, requireStaff, validate(UpdateProductSchema), productController.updateProductHandler.bind(productController))
router.delete('/', authenticate, requireStaff, productController.deleteProductHandler.bind(productController))
router.put('/restore', authenticate, requireStaff, productController.restoreProductHandler.bind(productController))
router.post('/upload-image', authenticate, requireStaff, uploadImage, productController.uploadProductImageHandler.bind(productController))

export default router
