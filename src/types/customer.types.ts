import type { RowDataPacket } from 'mysql2'


export interface Customer extends RowDataPacket {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    password_hash?: string
    phone: string | null
    address: string | null
    avatar: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
    delete_at: Date | null
}


export interface CreateCustomerData {
    username: string
    first_name: string
    last_name: string
    email: string
    password: string
    status: 'active',
}