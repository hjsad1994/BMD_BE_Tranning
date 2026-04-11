import { Router } from 'express'
import { OrderController } from '../tsoa-controllers/OrderController.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireStaff } from '../middleware/staff.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
    CreateOrderSchema,
    UpdateOrderStatusSchema,
    CancelOrderSchema,
} from '../validators/order.validator.js'

const router = Router()
const orderController = new OrderController()

router.get('/', authenticate, requireStaff, orderController.getAllOrdersHandler.bind(orderController))
router.get('/:orderId', authenticate, requireStaff, orderController.getOrderByIdHandler.bind(orderController))
router.post('/', authenticate, requireStaff, validate(CreateOrderSchema), orderController.createOrderHandler.bind(orderController))
router.put('/status', authenticate, requireStaff, validate(UpdateOrderStatusSchema), orderController.updateOrderStatusHandler.bind(orderController))
router.put('/cancel', authenticate, requireStaff, validate(CancelOrderSchema), orderController.cancelOrderHandler.bind(orderController))

export default router
