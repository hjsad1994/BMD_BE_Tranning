import type { RowDataPacket } from 'mysql2'

export interface Order extends RowDataPacket {
    id: number
    customer_id: number
    total_amount: number
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
    shipping_address: string | null
    created_at: Date
    updated_at: Date
}

export interface OrderItem extends RowDataPacket {
    id: number
    order_id: number
    product_id: number
    product_name: string
    product_image: string | null
    quantity: number
    price: number
    created_at: Date
    updated_at: Date
}

export interface OrderStatusHistory extends RowDataPacket {
    id: number
    order_id: number
    old_status: string | null
    new_status: string
    changed_by_staff_id: number | null
    note: string | null
    created_at: Date
}

export interface OrderDetail {
    id: number
    customer_id: number
    total_amount: number
    status: string
    shipping_address: string | null
    created_at: Date
    updated_at: Date
    items: {
        id: number
        product_id: number
        product_name: string
        product_image: string | null
        quantity: number
        price: number
    }[]
}

export interface CreateOrderItemInput {
    product_id: number
    quantity: number
}

export interface CreateOrderData {
    customer_id: number
    shipping_address: string
    items: CreateOrderItemInput[]
}

export interface UpdateOrderStatusData {
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
    note?: string
}

export interface CancelOrderData {
    note?: string
}
