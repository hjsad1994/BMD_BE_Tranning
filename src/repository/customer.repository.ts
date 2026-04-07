
import type { RowDataPacket } from 'mysql2'
import pool from '../db/mysql.js'


interface Customer extends RowDataPacket {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    password_hash: string
    phone: string | null
    address: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
}


export class CustomerRepository {
    async findById(id: number): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, status, created_at, updated_at FROM customer WHERE id = ? LIMIT 1',
            [id]
        )
        return rows[0] ?? null
    }

    async findAll(): Promise<Customer[]> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, status, created_at, updated_at FROM customer'
        )
        return rows
    }
}
