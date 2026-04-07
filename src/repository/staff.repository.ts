
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '../db/mysql.js'

interface Staff extends RowDataPacket {
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

interface CreateAdminData {
  username: string
  first_name: string
  last_name: string
  email: string
  password_hash: string
}
export class StaffRepository {
    async countStaff(): Promise<number> {
        const [rows] = await pool.promise().query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM staff'
        )
        return rows[0] !== undefined ? Number(rows[0].total) : 0
    }
    async findById(id: number): Promise<Staff | null> {
        const [rows] = await pool.promise().query<Staff[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, status, created_at, updated_at FROM staff WHERE id = ? LIMIT 1',
            [id]
        )
        return rows[0] ?? null
    }

    async findByEmail(email: string): Promise<Staff | null> {
        const [rows] = await pool.promise().query<Staff[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, status, created_at, updated_at FROM staff WHERE email = ? LIMIT 1',
            [email]
        )
        return rows[0] ?? null
    }

    async findAll(): Promise<Staff[]> {
        const [rows] = await pool.promise().query<Staff[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, status, created_at, updated_at FROM staff'
        )
        return rows
    }

    async createStaff(data: CreateAdminData): Promise<number> {
        const existing = await this.findByEmail(data.email) 
        if (existing) {
            throw new Error(`Staff with email '${data.email}' already exists`)
        }

        const [result] = await pool.promise().query<ResultSetHeader>(
            'INSERT INTO staff (username, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)',
            [data.username, data.first_name, data.last_name, data.email, data.password_hash]
        )
        return result.insertId
    }
}
