import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import pool from '../db/mysql.js'
import type { Product, CreateProductData, UpdateProductData } from '../types/product.types.js'

export class ProductRepository {

    async countProducts(): Promise<number> {
        const [rows] = await pool.promise().query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM products WHERE deleted_at IS NULL'
        )
        return rows[0] !== undefined ? Number(rows[0].total) : 0
    }

    async findById(id: number): Promise<Product | null> {
        const [rows] = await pool.promise().query<Product[]>(
            `SELECT id, category_id, name, description, price, stock, image_url, status, created_at, updated_at 
            FROM products WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
            [id]
        )
        return rows[0] ?? null
    }
    async findDeleteById(id: number): Promise<Product | null> {
        const [rows] = await pool.promise().query<Product[]>(
            `SELECT id, category_id, name, description, price, stock, image_url, status, created_at, updated_at
             FROM products WHERE id = ? AND deleted_at IS NOT NULL LIMIT 1`,
            [id]
        )
        return rows[0] ?? null
    }
        

    async findAll(): Promise<Product[]> {
        const [rows] = await pool.promise().query<Product[]>(
            `SELECT id, category_id, name, description, price, stock, image_url, status, created_at, updated_at
             FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC`
        )
        return rows
    }

    async findByCategoryId(categoryId: number): Promise<Product[]> {
        const [rows] = await pool.promise().query<Product[]>(
            `SELECT id, category_id, name, description, price, stock, image_url, status, created_at, updated_at
             FROM products WHERE category_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
            [categoryId]
        )
        return rows
    }

    async createProduct(data: CreateProductData): Promise<number> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            `INSERT INTO products (category_id, name, description, price, stock, image_url)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [data.category_id ?? null, data.name, data.description ?? null, data.price, data.stock, data.image_url ?? null]
        )
        return result.insertId
    }

    async updateProduct(id: number, data: UpdateProductData): Promise<boolean> {
        const fields: string[] = []
        const values: unknown[] = []

        if (data.category_id !== undefined) {
            fields.push('category_id = ?')
            values.push(data.category_id)
        }
        if (data.name !== undefined) {
            fields.push('name = ?')
            values.push(data.name)
        }
        if (data.description !== undefined) {
            fields.push('description = ?')
            values.push(data.description)
        }
        if (data.price !== undefined) {
            fields.push('price = ?')
            values.push(data.price)
        }
        if (data.stock !== undefined) {
            fields.push('stock = ?')
            values.push(data.stock)
        }
        if (data.image_url !== undefined) {
            fields.push('image_url = ?')
            values.push(data.image_url)
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
            `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
            values
        )
        return result.affectedRows > 0
    }

    async deleteProduct(id: number): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
            [id]
        )
        return result.affectedRows > 0
    }
    async restoreProduct(id: number): Promise<boolean> {
        const [result] = await pool.promise().query<ResultSetHeader>(
            'UPDATE products SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
            [id]
        )
        return result.affectedRows > 0
    }
}
