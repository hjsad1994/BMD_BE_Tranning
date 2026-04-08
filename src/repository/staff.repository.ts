import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '../db/mysql.js'
import type { Staff, CreateStaffData, UpdateProfileData } from '../types/staff.types.js'


export class StaffRepository {

    async countStaff(): Promise<number> {
        const [rows] = await pool.promise().query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM staff'
        )
        return rows[0] !== undefined ? Number(rows[0].total) : 0
    }

    async findById(id: number): Promise<Staff | null> {
        const [rows] = await pool.promise().query<Staff[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM staff WHERE id = ? LIMIT 1',
            [id]
        )
        return rows[0] ?? null
    }

    async findByUsername(username: string): Promise<Staff | null> {
        const [rows] = await pool.promise().query<Staff[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM staff WHERE username = ? LIMIT 1',
            [username]
        )
        return rows[0] ?? null
    }
    async findAuthByUsername(username: string): Promise<Staff | null> {
        const [rows] = await pool.promise().query<Staff[]>(
            `SELECT id, username, first_name, last_name, email, password_hash, phone, address, avatar,status, created_at, updated_at FROM staff WHERE username = ? LIMIT 1`,
            [username]
        )
        return rows[0] ?? null

    }
    async findAuthById(id: number): Promise<Staff | null> {
        const [rows] = await pool.promise().query<Staff[]>(
            `SELECT id, username, first_name, last_name, email, password_hash, phone, address, avatar,status, created_at, updated_at FROM staff WHERE id = ? LIMIT 1`,
            [id]
        )
        return rows[0] ?? null

    }
    async findByEmail(email: string): Promise<Staff | null> {
        const [rows] = await pool.promise().query<Staff[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM staff WHERE email = ? LIMIT 1',
            [email]
        )
        return rows[0] ?? null
    }

    async findAll(): Promise<Staff[]> {
        const [rows] = await pool.promise().query<Staff[]>(
            'SELECT id, username, first_name, last_name, email, phone, address, avatar, status, created_at, updated_at FROM staff'
        )
        return rows
    }

    async createStaff(data: CreateStaffData): Promise<number> {
        const [existingEmail, existingUsername] = await Promise.all([
            this.findByEmail(data.email),
            this.findByUsername(data.username)
        ])
        if (existingEmail) {
            throw new Error(`Staff with email '${data.email}' already exists`)
        }
        if (existingUsername) {
            throw new Error(`Staff with username '${data.username}' already exists`)
        }

        const [result] = await pool.promise().query<ResultSetHeader>(
            'INSERT INTO staff (username, first_name, last_name, email, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)',
            [data.username, data.first_name, data.last_name, data.email, data.password_hash, data.status]
        )
        return result.insertId
    }

    async updateProfile(id: number, data: UpdateProfileData): Promise<boolean> {
        const fields: string[] = []
        const values: unknown[] = []

        if (data.first_name !== undefined) {
            fields.push('first_name = ?')
            values.push(data.first_name)
        }
        if (data.last_name !== undefined) {
            fields.push('last_name = ?')
            values.push(data.last_name)
        }
        if (data.email !== undefined) {
            fields.push('email = ?')
            values.push(data.email)
        }
        if (data.phone !== undefined) {
            fields.push('phone = ?')
            values.push(data.phone)
        }
        if (data.address !== undefined) {
            fields.push('address = ?')
            values.push(data.address)
        }
        if (data.avatar !== undefined) {
            fields.push('avatar = ?')
            values.push(data.avatar)
        }

        if (fields.length === 0) {
            return false
        }

        values.push(id)
        const [result] = await pool.promise().query<ResultSetHeader>(
            `UPDATE staff SET ${fields.join(', ')} WHERE id = ?`,
            values
        )
        return result.affectedRows > 0
    }

    async updatePassword(id: number, passwordHash: string): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE staff SET password_hash = ? WHERE id = ?',
            [passwordHash, id]
        )
        return result.affectedRows > 0
    }   
    async updateStatus(id: number, status: 'active' | 'inactive'): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            `UPDATE staff SET status = ? WHERE id = ?`,
            [status, id]
        )
        return result.affectedRows > 0
    }

}
