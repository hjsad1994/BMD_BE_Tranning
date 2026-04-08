import type { RowDataPacket } from 'mysql2'

export interface Staff extends RowDataPacket {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    password_hash: string
    phone: string | null
    address: string | null
    avatar: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
}

export interface CreateStaffData {
    username: string
    first_name: string
    last_name: string
    email: string
    password_hash: string
    status: 'active',
}

export interface UpdateProfileData {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    address?: string
    avatar?: string
}

export interface InitStaffData {
    username: string
    first_name: string
    last_name: string
    email: string
    password: string
}
export interface LoginData {
    username: string
    password: string
}

export interface StaffProfile {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    address: string | null
    status: 'active' | 'inactive'
}
export interface StaffListParams {
    page: number
    limit: number
    search?: string
    status?: 'active' | 'inactive'
}