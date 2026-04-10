import type { ResultSetHeader } from 'mysql2'
import pool from '../db/mysql.js'
import type { Order, OrderItem } from '../types/order.types.js'

export class OrderRepository {

    async findAll(): Promise<Order[]> {
        const [rows] = await pool.promise().query<Order[]>(
            `SELECT id, customer_id, total_amount, status, shipping_address, created_at, updated_at
             FROM orders
             ORDER BY created_at DESC`
        )
        return rows
    }

    async findById(id: number): Promise<Order | null> {
        const [rows] = await pool.promise().query<Order[]>(
            `SELECT id, customer_id, total_amount, status, shipping_address, created_at, updated_at
             FROM orders
             WHERE id = ?
             LIMIT 1`,
            [id]
        )
        return rows[0] ?? null
    }

    async findItemsByOrderId(orderId: number): Promise<OrderItem[]> {
        const [rows] = await pool.promise().query<OrderItem[]>(
            `SELECT id, order_id, product_id, product_name, product_image, quantity, price, created_at, updated_at
             FROM order_items
             WHERE order_id = ?`,
            [orderId]
        )
        return rows
    }

    async createOrder(
        customerId: number,
        totalAmount: number,
        shippingAddress: string
    ): Promise<number> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            `INSERT INTO orders (customer_id, total_amount, status, shipping_address)
             VALUES (?, ?, 'PENDING', ?)`,
            [customerId, totalAmount, shippingAddress]
        )
        return result.insertId
    }

    // Bulk insert all items in a single query
    async createOrderItems(
        orderId: number,
        items: {
            product_id:    number
            product_name:  string
            product_image: string | null
            quantity:      number
            price:         number
        }[]
    ): Promise<void> {
        const values = items.map(item => [
            orderId,
            item.product_id,
            item.product_name,
            item.product_image,
            item.quantity,
            item.price,
        ])

        await pool.promise().query<ResultSetHeader>(
            `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
             VALUES ?`,
            [values]
        )
    }

    async updateStatus(id: number, status: string): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            `UPDATE orders SET status = ? WHERE id = ?`,
            [status, id]
        )
        return result.affectedRows > 0
    }

    async createStatusHistory(
        orderId:   number,
        oldStatus: string | null,
        newStatus: string,
        staffId:   number,
        note?:     string
    ): Promise<void> {
        await pool.promise().query<ResultSetHeader>(
            `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by_staff_id, note)
             VALUES (?, ?, ?, ?, ?)`,
            [orderId, oldStatus, newStatus, staffId, note ?? null]
        )
    }
}
