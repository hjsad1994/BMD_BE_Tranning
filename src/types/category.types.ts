import type { RowDataPacket } from 'mysql2'

export interface Category extends RowDataPacket {
    id: number
    name: string
    description: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
}

export interface CreateCategoryData {
    name: string
    description?: string
}

export interface UpdateCategoryData {
    name?: string
    description?: string
    status?: 'active' | 'inactive'
}
