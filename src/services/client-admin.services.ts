import { CustomerRepository } from '../repository/customer.repository.js'

import bcrypt from 'bcrypt'
import type { CreateCustomerData, UpdateCustomerData } from '../types/customer.types.js'

export class CustomerServices {
    private customerRepository = new CustomerRepository()

    async createCustomer(data: CreateCustomerData) {
        const password_hash = await bcrypt.hash(data.password, 10)
        const customerId = await this.customerRepository.createCustomer({
            ...data,
            password: password_hash,
            status: 'active'
        })
        return { id: customerId, username: data.username, email: data.email }
    }

    async getAllCustomers(page: number, limit: number) {
        const [customers, total] = await Promise.all([
            this.customerRepository.findAllPaginated(page, limit),
            this.customerRepository.countCustomers(),
        ])
        return {
            customers,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    }

    async getCustomerById(id: number) {
        const customer = await this.customerRepository.findById(id)
        if (!customer) {
            throw new Error('Customer not found')
        }
        return customer
    }

    async updateCustomer(id: number, data: UpdateCustomerData): Promise<boolean> {
        const customer = await this.customerRepository.findById(id)
        if (!customer) {
            throw new Error('Customer not found')
        }

        const hasData =
            data.first_name !== undefined ||
            data.last_name  !== undefined ||
            data.email      !== undefined ||
            data.phone      !== undefined ||
            data.address    !== undefined ||
            data.avatar     !== undefined

        if (!hasData) {
            throw new Error('No data to update')
        }

        if (data.email !== undefined) {
            const existing = await this.customerRepository.findByEmail(data.email)
            if (existing && existing.id !== id) {
                throw new Error('Email already in use by another customer')
            }
        }

        return this.customerRepository.updateCustomer(id, data)
    }

    async updateStatus(id: number, status: 'active' | 'inactive'): Promise<boolean> {
        const customer = await this.customerRepository.findById(id)
        if (!customer) {
            throw new Error('Customer not found')
        }
        return this.customerRepository.updateStatus(id, status)
    }

    async deleteCustomer(id: number): Promise<boolean> {
        const customer = await this.customerRepository.findById(id)
        if (!customer) {
            throw new Error('Customer not found')
        }
        return this.customerRepository.deleteCustomer(id)
    }

    async restoreCustomer(id: number): Promise<boolean> {
        const customer = await this.customerRepository.findDeletedById(id)
        if (!customer) {
            throw new Error('Customer not found or not deleted')
        }
        return this.customerRepository.restoreCustomer(id)
    }

    // Admin resets a customer's password without knowing the current one
    async resetPassword(id: number, newPassword: string): Promise<boolean> {
        const customer = await this.customerRepository.findById(id)
        if (!customer) {
            throw new Error('Customer not found')
        }
        const passwordHash = await bcrypt.hash(newPassword, 10)
        return this.customerRepository.updatePasswordHash(id, passwordHash)
    }
}
