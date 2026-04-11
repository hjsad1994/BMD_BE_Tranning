import {
    Body,
    Controller,
    Get,
    Path,
    Post,
    Put,
    Query,
    Route,
    Security,
    Tags,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { OrderServices } from '../services/order.services.js'
import type {
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    OrderResponse,
    OrderListResponse,
    OrderDetailResponse,
    CreatedOrderResponse,
} from '../types/api-response.types.js'

interface CreateOrderItemBody {
    /** @example 1 */
    product_id: number
    /** @example 2 */
    quantity: number
}

interface CreateOrderBody {
    /** @example 1 */
    customer_id: number
    /** @example "123 Nguyen Trai, Q1, Ho Chi Minh City" */
    shipping_address: string
    /** @example [{ "product_id": 1, "quantity": 2 }] */
    items: CreateOrderItemBody[]
}

interface UpdateOrderStatusBody {
    /** @example "CONFIRMED" */
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
    /** @example "Order confirmed by admin" */
    note?: string
}

interface CancelOrderBody {
    /** @example "Customer requested cancellation" */
    note?: string
}

const orderService = new OrderServices()

@Route('api/admin/orders')
@Tags('Admin - Orders')
@Security('bearerAuth')
export class OrderController extends Controller {

    /** @summary Get all orders */
    @Get()
    async getAllOrders(
        /** @example 1 */  @Query() page: number = 1,
        /** @example 20 */ @Query() limit: number = 20
    ): Promise<ApiResponse<OrderListResponse> | ApiErrorResponse> {
        if (page < 1 || !Number.isInteger(Number(page))) {
            this.setStatus(400)
            return { success: false, message: 'page must be a positive integer >= 1' }
        }
        if (limit < 1 || limit > 100) {
            this.setStatus(400)
            return { success: false, message: 'limit must be between 1 and 100' }
        }
        try {
            const result = await orderService.getAllOrders(Number(page), Number(limit))
            return { success: true, data: result as OrderListResponse, message: 'Get orders successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Get order detail by ID (includes items) */
    @Get('{orderId}')
    async getOrderById(
        /** @example 1 */ @Path() orderId: number
    ): Promise<ApiResponse<OrderDetailResponse> | ApiErrorResponse> {
        if (!orderId || Number.isNaN(orderId)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid order id' }
        }
        try {
            const result = await orderService.getOrderById(orderId)
            return { success: true, data: result as unknown as OrderDetailResponse, message: 'Get order successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Order not found' }
        }
    }

    /** @summary Create a new order */
    @Post()
    async createOrder(
        @Body() body: CreateOrderBody
    ): Promise<ApiResponse<CreatedOrderResponse> | ApiErrorResponse> {
        try {
            // staffId is not available in tsoa context — use 0 as placeholder; actual staffId handled by Express handler
            const result = await orderService.createOrder(body, 0)
            this.setStatus(201)
            return { success: true, data: result as CreatedOrderResponse, message: 'Order created successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Create order failed' }
        }
    }

    /** @summary Update order status */
    @Put('status')
    async updateOrderStatus(
        /** @example 1 */ @Query() id: number,
        @Body() body: UpdateOrderStatusBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid order id' }
        }
        try {
            await orderService.updateOrderStatus(id, body, 0)
            return { success: true, message: 'Order status updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update status failed' }
        }
    }

    /** @summary Cancel an order */
    @Put('cancel')
    async cancelOrder(
        /** @example 1 */ @Query() id: number,
        @Body() body: CancelOrderBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid order id' }
        }
        try {
            await orderService.cancelOrder(id, 0, body.note)
            return { success: true, message: 'Order cancelled successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Cancel order failed' }
        }
    }

    // ── Express handlers ──────────────────────────────────────────────────────

    async getAllOrdersHandler(req: ExpressRequest, res: Response) {
        const page  = Number(req.query.page)  || 1
        const limit = Number(req.query.limit) || 20
        if (page < 1) {
            return res.status(400).json({ success: false, message: 'page must be >= 1' })
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ success: false, message: 'limit must be between 1 and 100' })
        }
        try {
            const result = await orderService.getAllOrders(page, limit)
            return res.status(200).json({ success: true, data: result, message: 'Get orders successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getOrderByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.params.orderId)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order id' })
        }
        try {
            const result = await orderService.getOrderById(id)
            return res.status(200).json({ success: true, data: result, message: 'Get order successfully' })
        } catch (error) {
            return res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'Order not found' })
        }
    }

    async createOrderHandler(req: ExpressRequest, res: Response) {
        // staffId is set by authenticate middleware
        const staffId = req.user?.id
        if (!staffId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        try {
            const result = await orderService.createOrder(req.body, staffId)
            return res.status(201).json({ success: true, data: result, message: 'Order created successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Create order failed' })
        }
    }

    async updateOrderStatusHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order id' })
        }
        const staffId = req.user?.id
        if (!staffId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        try {
            await orderService.updateOrderStatus(id, req.body, staffId)
            return res.status(200).json({ success: true, message: 'Order status updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update status failed' })
        }
    }

    async cancelOrderHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order id' })
        }
        const staffId = req.user?.id
        if (!staffId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        try {
            await orderService.cancelOrder(id, staffId, req.body?.note)
            return res.status(200).json({ success: true, message: 'Order cancelled successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Cancel order failed' })
        }
    }
}
