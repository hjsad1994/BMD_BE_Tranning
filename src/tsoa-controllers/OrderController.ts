import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Query,
    Route,
    Security,
    Tags,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { OrderServices } from '../services/order.services.js'

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
@Tags('Orders')
@Security('bearerAuth')
export class OrderController extends Controller {

    /** @summary Get all orders */
    @Get()
    async getAllOrders(): Promise<unknown> {
        try {
            const result = await orderService.getAllOrders()
            return { success: true, data: result, message: 'Get orders successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Get order detail by ID (includes items) */
    @Get('detail')
    async getOrderById(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid order id' }
        }
        try {
            const result = await orderService.getOrderById(id)
            return { success: true, data: result, message: 'Get order successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Order not found' }
        }
    }

    /** @summary Create a new order */
    @Post()
    async createOrder(@Body() body: CreateOrderBody): Promise<unknown> {
        try {
            // staffId is not available in tsoa context — use 0 as placeholder
            // actual staffId is handled in the Express handler below
            const result = await orderService.createOrder(body, 0)
            this.setStatus(201)
            return { success: true, data: result, message: 'Order created successfully' }
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
    ): Promise<unknown> {
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
    ): Promise<unknown> {
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

    // ── Express handlers used by order.routes.ts ──────────────────────────────

    async getAllOrdersHandler(_req: ExpressRequest, res: Response) {
        try {
            const result = await orderService.getAllOrders()
            return res.status(200).json({ success: true, data: result, message: 'Get orders successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getOrderByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
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
