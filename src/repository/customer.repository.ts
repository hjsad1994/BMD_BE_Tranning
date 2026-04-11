import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '../db/mysql.js'
import type { Customer, CreateCustomerData, UpdateCustomerData } from '../types/customer.types.js'

export class CustomerRepository {

    async countCustomers(): Promise<number> {
        const [rows] = await pool.promise().query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM customer WHERE deleted_at IS NULL'
        )
        return rows[0] !== undefined ? Number(rows[0].total) : 0
    }

    async findById(id: number): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM customer WHERE id = ? AND deleted_at IS NULL LIMIT 1',
            [id]
        )
        return rows[0] ?? null
    }

    async findDeletedById(id: number): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM customer WHERE id = ? AND deleted_at IS NOT NULL LIMIT 1',
            [id]
        )
        return rows[0] ?? null
    }

    async findAll(): Promise<Customer[]> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM customer WHERE deleted_at IS NULL ORDER BY created_at DESC'
        )
        return rows
    }

    async findAllPaginated(page: number, limit: number): Promise<Customer[]> {
        const offset = (page - 1) * limit
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM customer WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        )
        return rows
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id FROM customer WHERE email = ? AND deleted_at IS NULL LIMIT 1',
            [email]
        )
        return rows[0] ?? null
    }

    async findByUsername(username: string): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id FROM customer WHERE username = ? AND deleted_at IS NULL LIMIT 1',
            [username]
        )
        return rows[0] ?? null
    }

    async findAuthByUsername(username: string): Promise<Customer | null> {
        const [rows] = await pool.promise().query<Customer[]>(
            'SELECT id, username, first_name, last_name, email, password_hash, phone, address, avatar, status FROM customer WHERE username = ? AND deleted_at IS NULL LIMIT 1',
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

    async updateCustomer(id: number, data: UpdateCustomerData): Promise<boolean> {
        const fields: string[] = []
        const values: unknown[] = []

        if (data.first_name !== undefined) { 
            fields.push('first_name = ?'); 
            values.push(data.first_name) 
        }
        if (data.last_name  !== undefined) { 
            fields.push('last_name = ?');  
            values.push(data.last_name)  
        }
        if (data.email      !== undefined) { 
            fields.push('email = ?');      
            values.push(data.email)      
        }
        if (data.phone      !== undefined) { 
            fields.push('phone = ?');      
            values.push(data.phone)      
        }
        if (data.address    !== undefined) { 
            fields.push('address = ?');    
            values.push(data.address)    
        }
        if (data.avatar     !== undefined) { 
            fields.push('avatar = ?');     
            values.push(data.avatar)     
        }

        if (fields.length === 0) return false

        values.push(id)
        const [result] = await pool.promise().query<ResultSetHeader>(
            `UPDATE customer SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
            values
        )
        return result.affectedRows > 0
    }

    async updateStatus(id: number, status: 'active' | 'inactive'): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE customer SET status = ? WHERE id = ? AND deleted_at IS NULL',
            [status, id]
        )
        return result.affectedRows > 0
    }

    async deleteCustomer(id: number): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE customer SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
            [id]
        )
        return result.affectedRows > 0
    }

    async restoreCustomer(id: number): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE customer SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
            [id]
        )
        return result.affectedRows > 0
    }

    async updatePasswordHash(id: number, passwordHash: string): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE customer SET password_hash = ? WHERE id = ? AND deleted_at IS NULL',
            [passwordHash, id]
        )
        return result.affectedRows > 0
    }
}
