import { Router } from 'express'
import { CategoryController } from '../tsoa-controllers/CategoryController.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { CreateCategorySchema, UpdateCategorySchema } from '../validators/category.validator.js'

const router = Router()
const categoryController = new CategoryController()

router.get('/', authenticate, requireStaff, categoryController.getAllCategoriesHandler.bind(categoryController))
router.get('/detail', authenticate, requireStaff, categoryController.getCategoryByIdHandler.bind(categoryController))
router.post('/', authenticate, requireStaff, validate(CreateCategorySchema), categoryController.createCategoryHandler.bind(categoryController))
router.put('/', authenticate, requireStaff, validate(UpdateCategorySchema), categoryController.updateCategoryHandler.bind(categoryController))
router.delete('/', authenticate, requireStaff, categoryController.deleteCategoryHandler.bind(categoryController))
router.put('/restore', authenticate, requireStaff, categoryController.restoreCategoryHandler.bind(categoryController))

export default router
