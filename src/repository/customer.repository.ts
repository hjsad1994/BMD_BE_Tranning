
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '../db/mysql.js'
import type { CreateCustomerData } from '../types/customer.types.js'

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
    async findByEmail(email: string): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id FROM customer WHERE email = ? LIMIT 1',
            [email]
        )
        return rows[0] ?? null
    }

    async findByUsername(username: string): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id FROM customer WHERE username = ? LIMIT 1',
            [username]
        )
        return rows[0] ?? null
    }

    async createCustomer(data: CreateCustomerData): Promise<number> {
        const [existingEmail, existingUsername] = await Promise.all([
            this.findByEmail(data.email),
            this.findByUsername(data.username)
        ])
        if (existingEmail) {
            throw new Error(`Customer with email '${data.email}' already exists`)
        }
        if (existingUsername) {
            throw new Error(`Customer with username '${data.username}' already exists`)
        }

        const [result] = await pool.promise().query<ResultSetHeader>(
            'INSERT INTO customer (username, first_name, last_name, email, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)',
            [data.username, data.first_name, data.last_name, data.email, data.password, data.status]
        )
        return result.insertId
    }
}
