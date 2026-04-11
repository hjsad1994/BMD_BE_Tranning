import { OrderRepository } from '../repository/order.repository.js'
import { CustomerRepository } from '../repository/customer.repository.js'
import { ProductRepository } from '../repository/product.repository.js'
import type {
    OrderDetail,
    CreateOrderData,
    UpdateOrderStatusData,
} from '../types/order.types.js'

export class OrderServices {
    private orderRepository    = new OrderRepository()
    private customerRepository = new CustomerRepository()
    private productRepository  = new ProductRepository()

    async getAllOrders(page: number, limit: number) {
        const [orders, total] = await Promise.all([
            this.orderRepository.findAllPaginated(page, limit),
            this.orderRepository.countOrders(),
        ])
        return {
            orders,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    }

    async getOrderById(id: number): Promise<OrderDetail> {
        const order = await this.orderRepository.findById(id)
        if (!order) {
            throw new Error('Order not found')
        }

        const items = await this.orderRepository.findItemsByOrderId(id)

        return {
            id:               order.id,
            customer_id:      order.customer_id,
            total_amount:     order.total_amount,
            status:           order.status,
            shipping_address: order.shipping_address,
            created_at:       order.created_at,
            updated_at:       order.updated_at,
            items: items.map(item => ({
                id:            item.id,
                product_id:    item.product_id,
                product_name:  item.product_name,
                product_image: item.product_image,
                quantity:      item.quantity,
                price:         item.price,
            })),
        }
    }

    async createOrder(data: CreateOrderData, staffId: number) {
        const customer = await this.customerRepository.findById(data.customer_id)
        if (!customer) {
            throw new Error('Customer not found')
        }
        if (customer.status !== 'active') {
            throw new Error('Customer account is inactive')
        }

        const orderItemsToInsert: {
            product_id:    number
            product_name:  string
            product_image: string | null
            quantity:      number
            price:         number
        }[] = []

        let totalAmount = 0

        for (const item of data.items) {
            const product = await this.productRepository.findById(item.product_id)
            if (!product) {
                throw new Error(`Product with id ${item.product_id} not found`)
            }

            // Snapshot price and name at the time of purchase — never trust client-side price
            totalAmount += product.price * item.quantity

            orderItemsToInsert.push({
                product_id:    product.id,
                product_name:  product.name,
                product_image: product.image_url,
                quantity:      item.quantity,
                price:         product.price,
            })
        }

        const orderId = await this.orderRepository.createOrder(
            data.customer_id,
            totalAmount,
            data.shipping_address
        )

        await this.orderRepository.createOrderItems(orderId, orderItemsToInsert)

        // Record initial status history with null old_status
        await this.orderRepository.createStatusHistory(
            orderId,
            null,
            'PENDING',
            staffId,
            'Order created'
        )

        return { id: orderId, total_amount: totalAmount, status: 'PENDING' }
    }

    async updateOrderStatus(
        orderId: number,
        data: UpdateOrderStatusData,
        staffId: number
    ): Promise<boolean> {
        const order = await this.orderRepository.findById(orderId)
        if (!order) {
            throw new Error('Order not found')
        }

        // Define which transitions are allowed from each status
        const allowedTransitions: Record<string, string[]> = {
            'PENDING':   ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED': ['SHIPPING',  'CANCELLED'],
            'SHIPPING':  ['COMPLETED'],
            'COMPLETED': [],
            'CANCELLED': [],
        }

        const allowed = allowedTransitions[order.status] ?? []

        if (!allowed.includes(data.status)) {
            throw new Error(
                `Cannot transition from '${order.status}' to '${data.status}'. ` +
                `Allowed: ${allowed.length > 0 ? allowed.join(', ') : 'none'}`
            )
        }

        const updated = await this.orderRepository.updateStatus(orderId, data.status)

        if (updated) {
            await this.orderRepository.createStatusHistory(
                orderId,
                order.status,
                data.status,
                staffId,
                data.note
            )
        }

        return updated
    }

    async cancelOrder(
        orderId: number,
        staffId: number,
        note?: string
    ): Promise<boolean> {
        const order = await this.orderRepository.findById(orderId)
        if (!order) {
            throw new Error('Order not found')
        }
        
        // Only PENDING and CONFIRMED orders can be cancelled
        const cancellableStatuses = ['PENDING', 'CONFIRMED']
        if (!cancellableStatuses.includes(order.status)) {
            throw new Error(
                `Cannot cancel order with status '${order.status}'. Only PENDING or CONFIRMED orders can be cancelled`
            )
        }

        const updated = await this.orderRepository.updateStatus(orderId, 'CANCELLED')

        if (updated) {
            await this.orderRepository.createStatusHistory(
                orderId,
                order.status,
                'CANCELLED',
                staffId,
                note ?? 'Order cancelled by admin'
            )
        }

        return updated
    }
}
