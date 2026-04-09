import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '../db/mysql.js'
import type { Category, CreateCategoryData, UpdateCategoryData } from '../types/category.types.js'

export class CategoryRepository {

    async countCategories(): Promise<number> {
        const [rows] = await pool.promise().query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM categories'
        )
        return rows[0] !== undefined ? Number(rows[0].total) : 0
    }

    async findById(id: number): Promise<Category | null> {
        const [rows] = await pool.promise().query<Category[]>(
            'SELECT id, name, description, status, created_at, updated_at FROM categories WHERE id = ? AND deleted_at IS NULL LIMIT 1',
            [id]
        )
        return rows[0] ?? null
    }
    async findDeleteById(id: number): Promise<Category | null> {
        const [rows] = await pool.promise().query<Category[]>(
            'SELECT id, name, description, status, created_at, updated_at FROM categories WHERE id = ? AND deleted_at IS NOT NULL LIMIT 1',
            [id]
        )
        return rows[0] ?? null
    }
    async findByName(name: string): Promise<Category | null> {
        const [rows] = await pool.promise().query<Category[]>(
            'SELECT id, name, description, status, created_at, updated_at FROM categories WHERE name = ? AND deleted_at IS NULL LIMIT 1',
            [name]
        )
        return rows[0] ?? null
    }

    async findAll(): Promise<Category[]> {
        const [rows] = await pool.promise().query<Category[]>(
            'SELECT id, name, description, status, created_at, updated_at FROM categories WHERE deleted_at IS NULL ORDER BY created_at DESC'
        )
        return rows
    }

    async createCategory(data: CreateCategoryData): Promise<number> {
        const existing = await this.findByName(data.name)
        if (existing) {
            throw new Error(`Category with name '${data.name}' already exists`)
        }

        const [result] = await pool.promise().query<ResultSetHeader>(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [data.name, data.description ?? null]
        )
        return result.insertId
    }

    async updateCategory(id: number, data: UpdateCategoryData): Promise<boolean> {
        const fields: string[] = []
        const values: unknown[] = []

        if (data.name !== undefined) {
            fields.push('name = ?')
            values.push(data.name)
        }
        if (data.description !== undefined) {
            fields.push('description = ?')
            values.push(data.description)
        }
        if (data.status !== undefined) {
            fields.push('status = ?')
            values.push(data.status)
        }

        if (fields.length === 0) {
            return false
        }

        values.push(id)
        const [result] = await pool.promise().query<ResultSetHeader>(
            `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
            values
        )
        return result.affectedRows > 0
    }

    async deleteCategory(id: number): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE categories SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
            [id]
        )
        return result.affectedRows > 0
    }
    async restoreCategory(id: number): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE categories SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
            [id]
        )
        return result.affectedRows > 0
    }
}
