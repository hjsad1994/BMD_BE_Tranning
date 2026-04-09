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

// Raw row returned by JOIN query
export interface ProductWithCategoryRow extends RowDataPacket {
    id: number
    name: string
    description: string | null
    price: number
    stock: number
    image_url: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
    // category fields 
    cat_id: number | null
    cat_name: string | null
    cat_description: string | null
    cat_status: string | null
}

// Formatted response with nested category
export interface ProductResponse {
    id: number
    name: string
    description: string | null
    price: number
    stock: number
    image_url: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
    category: {
        id: number
        name: string
        description: string | null
        status: string
    } | null
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
