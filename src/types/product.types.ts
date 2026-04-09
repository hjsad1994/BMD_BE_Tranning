import type { RowDataPacket } from 'mysql2'

export interface Product extends RowDataPacket {
    id: number
    category_id: number | null
    name: string
    description: string | null
    price: number
    stock: number
    image_url: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
}

export interface CreateProductData {
    category_id?: number
    name: string
    description?: string
    price: number
    stock: number
    image_url?: string
}

export interface UpdateProductData {
    category_id?: number
    name?: string
    description?: string
    price?: number
    stock?: number
    image_url?: string
    status?: 'active' | 'inactive'
}
